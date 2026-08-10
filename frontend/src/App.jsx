import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InventoryGrid from './components/InventoryGrid';
import WorkbenchKanban from './components/WorkbenchKanban';
import SalesView from './components/SalesView';
import MasterPartsCatalog from './components/MasterPartsCatalog';
import UnitDetailModal from './components/UnitDetailModal';
import QuickIntakeModal from './components/QuickIntakeModal';
import GoogleDriveAuthModal from './components/GoogleDriveAuthModal';
import { 
  getDashboardStats, 
  getInventory, 
  getUnitDetail, 
  createUnitIntake, 
  updateUnitStatus,
  updateUnit,
  updateRepairLog,
  addPartOrder,
  updatePartOrder,
  deletePartOrder,
  createSalesListing,
  updateSalesListing
} from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  
  const [stats, setStats] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitDetail, setUnitDetail] = useState(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sData, uData] = await Promise.all([
        getDashboardStats(),
        getInventory()
      ]);
      setStats(sData);
      setUnits(uData);

      // If unit detail modal is currently open, refresh it as well
      if (selectedUnitId) {
        const uDetail = await getUnitDetail(selectedUnitId);
        setUnitDetail(uDetail);
      }
    } catch (err) {
      console.error('Failed to load data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedUnitId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectUnit = async (id) => {
    try {
      setSelectedUnitId(id);
      const uDetail = await getUnitDetail(id);
      setUnitDetail(uDetail);
    } catch (err) {
      console.error('Failed to get unit detail:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedUnitId(null);
    setUnitDetail(null);
  };

  const handleQuickIntakeSubmit = async (data) => {
    try {
      const newUnit = await createUnitIntake(data);
      setIsIntakeOpen(false);
      await loadData();
      // Auto open detail for newly logged unit
      handleSelectUnit(newUnit.unit_id);
    } catch (err) {
      alert('Failed to log intake: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpdateStatus = async (unitId, newStatus) => {
    try {
      await updateUnitStatus(unitId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdateUnit = async (unitId, data) => {
    try {
      await updateUnit(unitId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to update unit:', err);
    }
  };

  const handleUpdateRepairLog = async (unitId, data) => {
    try {
      await updateRepairLog(unitId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to update repair log:', err);
    }
  };

  const handleAddPart = async (unitId, data) => {
    try {
      await addPartOrder(unitId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to add part:', err);
    }
  };

  const handleUpdatePartStatus = async (partId, data) => {
    try {
      await updatePartOrder(partId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to update part order:', err);
    }
  };

  const handleDeletePart = async (partId) => {
    try {
      await deletePartOrder(partId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete part order:', err);
    }
  };

  const handleCreateSalesListing = async (unitId, data) => {
    try {
      await createSalesListing(unitId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to create sales listing:', err);
    }
  };

  const handleUpdateSalesListing = async (listingId, data) => {
    try {
      await updateSalesListing(listingId, data);
      await loadData();
    } catch (err) {
      console.error('Failed to update sales listing:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Header & Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        search={search}
        setSearch={setSearch}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-slate-600">Connecting to Repair-It local engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats}
                onSelectUnit={handleSelectUnit}
                onOpenIntake={() => setIsIntakeOpen(true)}
                setActiveTab={setActiveTab}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryGrid 
                units={units}
                onSelectUnit={handleSelectUnit}
                onOpenIntake={() => setIsIntakeOpen(true)}
                search={search}
                setSearch={setSearch}
              />
            )}

            {activeTab === 'kanban' && (
              <WorkbenchKanban 
                units={units}
                onSelectUnit={handleSelectUnit}
                onUpdateStatus={handleUpdateStatus}
                onOpenIntake={() => setIsIntakeOpen(true)}
              />
            )}

            {activeTab === 'master_parts' && (
              <MasterPartsCatalog />
            )}

            {activeTab === 'sales' && (
              <SalesView 
                units={units}
                onSelectUnit={handleSelectUnit}
              />
            )}
          </>
        )}
      </main>

      {/* Unit Detail Modal */}
      {selectedUnitId && (
        <UnitDetailModal
          unit={unitDetail}
          onClose={handleCloseModal}
          onUpdateUnit={handleUpdateUnit}
          onUpdateRepairLog={handleUpdateRepairLog}
          onAddPart={handleAddPart}
          onUpdatePartStatus={handleUpdatePartStatus}
          onDeletePart={handleDeletePart}
          onCreateSalesListing={handleCreateSalesListing}
          onUpdateSalesListing={handleUpdateSalesListing}
        />
      )}

      {/* Quick Intake Modal */}
      {isIntakeOpen && (
        <QuickIntakeModal
          onClose={() => setIsIntakeOpen(false)}
          onSubmit={handleQuickIntakeSubmit}
        />
      )}

      {/* Google Drive Auth Modal */}
      <GoogleDriveAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

    </div>
  );
}
