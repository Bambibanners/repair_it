# Repair-It - Vintage Electronics Lifecycle Management Platform

Bespoke inventory, repair tracking, workbench Kanban, and true net profit management system tailored for vintage electronics, audio gear, and workshop use.

---

## Quick Setup & Start on Ubuntu / Raspberry Pi

### Option 1: One-Line Automatic Setup

Clone the repository on your Ubuntu / Raspberry Pi server and run the setup script:

```bash
git clone https://github.com/Bambibanners/repair_it.git
cd repair_it
./setup.sh
./start.sh
```

Once running, access the web app at:
`http://<your-raspberry-pi-ip>:10930`

---

### Firewall Configuration (UFW)

If UFW (Uncomplicated Firewall) is active on your Ubuntu / Raspberry Pi server, open port `10930` (Web Interface) and port `8000` (Backend API):

```bash
# Allow web app port
sudo ufw allow 10930/tcp comment 'Repair-It Web Application'

# (Optional) Allow backend API port
sudo ufw allow 8000/tcp comment 'Repair-It Backend API'

# Reload firewall
sudo ufw reload
```

---

### Option 2: Run 24/7 as Systemd Background Service

To keep **Repair-It** running automatically in the background even after restarting your Raspberry Pi:

```bash
# 1. Copy the systemd service unit file
sudo cp repair-it.service /etc/systemd/system/repair-it.service

# 2. Reload systemd daemon and enable service on boot
sudo systemctl daemon-reload
sudo systemctl enable repair-it
sudo systemctl start repair-it

# 3. Check status
sudo systemctl status repair-it
```

---

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React icons.
- **Backend**: Python FastAPI, SQLAlchemy ORM, Pydantic v2.
- **Database**: SQLite (built-in zero configuration) or PostgreSQL.
- **Net Profit Formula**:
  $$\text{Net Profit} = \text{Final Sale Price} - (\text{Purchase Base Cost} + \text{Parts Total} + \text{Platform Fees} + \text{Shipping Costs})$$
