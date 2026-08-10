from datetime import date
from .database import SessionLocal, engine, Base
from .models import InventoryUnit, RepairLog, PartOrder, SalesListing

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if database is already populated
    if db.query(InventoryUnit).count() > 0:
        db.close()
        return

    print("Seeding database with realistic vintage audio equipment...")

    # Unit 1: Pioneer PD-6030 (CD Transport) - On Bench
    u1 = InventoryUnit(
        brand="Pioneer",
        model_number="PD-6030",
        serial_number="SN-998273",
        category="CD Player",
        acquisition_source="eBay UK",
        base_cost=45.00,
        cosmetic_condition="Good",
        system_status="On Bench"
    )
    db.add(u1)
    db.flush()

    r1 = RepairLog(
        unit_id=u1.unit_id,
        priority=1, # High Priority
        initial_symptoms="Drawer sticks when opening. Laser skips randomly on tracks past #4.",
        action_plan="Replace all 3 transport mechanism pulleys and drawer belt. Clean optical pickup lens.",
        bench_notes="12 Aug: Dismantled optical mechanism. Cleaned factory grease from gear slides. Laser lens cleaned with isopropyl alcohol. Ready for replacement pulleys."
    )
    db.add(r1)

    p1_1 = PartOrder(
        unit_id=u1.unit_id,
        description="3x Drive Pulleys & Belts",
        supplier="WebSpareParts",
        cost=8.00,
        order_status="Received",
        eta_date=date(2026, 8, 10)
    )
    p1_2 = PartOrder(
        unit_id=u1.unit_id,
        description="Transport Drawer Belt",
        supplier="eBay",
        cost=4.50,
        order_status="Installed",
        eta_date=date(2026, 8, 8)
    )
    db.add_all([p1_1, p1_2])

    sl1 = SalesListing(
        unit_id=u1.unit_id,
        platform="eBay",
        target_price=150.00,
        listing_url="https://www.ebay.co.uk/itm/pioneer-pd-6030",
        is_active=False
    )
    db.add(sl1)

    # Unit 2: Aiwa AD-6400 (Tape Deck) - Waiting Parts
    u2 = InventoryUnit(
        brand="Aiwa",
        model_number="AD-6400",
        serial_number="SN-110938",
        category="Tape Deck",
        acquisition_source="Car Boot Sale",
        base_cost=15.00,
        cosmetic_condition="Fair",
        system_status="Waiting Parts"
    )
    db.add(u2)
    db.flush()

    r2 = RepairLog(
        unit_id=u2.unit_id,
        priority=2, # Med Priority
        initial_symptoms="Play and Rewind non-responsive. Motor whines when powered.",
        action_plan="Order replacement capstan belts and pinch roller.",
        bench_notes="Original belts dissolved into gooey black liquid. Pulley wheels thoroughly degreased with acetone."
    )
    db.add(r2)

    p2 = PartOrder(
        unit_id=u2.unit_id,
        description="Capstan & Flywheel Belt Kit",
        supplier="Mouser Electronics",
        cost=12.50,
        order_status="Shipped",
        eta_date=date(2026, 8, 14)
    )
    db.add(p2)

    # Unit 3: NAD 302 (Amplifier) - Sold
    u3 = InventoryUnit(
        brand="NAD",
        model_number="302",
        serial_number="SN-773645",
        category="Amplifier",
        acquisition_source="Gumtree",
        base_cost=30.00,
        cosmetic_condition="Mint",
        system_status="Sold"
    )
    db.add(u3)
    db.flush()

    r3 = RepairLog(
        unit_id=u3.unit_id,
        priority=3,
        initial_symptoms="Crackling noise in left channel when turning volume potentiometer. Mild hum.",
        action_plan="DeoxIT D5 flush of all potentiometers and switches. Recap power filter caps.",
        bench_notes="Serviced potentiometer with DeoxIT. Ground loop hum resolved by resoldering transformer ground tap. Tested 24 hours burn-in clean output."
    )
    db.add(r3)

    p3 = PartOrder(
        unit_id=u3.unit_id,
        description="Nichicon 4700uF Filter Capacitors x2",
        supplier="Farnell",
        cost=9.20,
        order_status="Installed",
        eta_date=date(2026, 8, 2)
    )
    db.add(p3)

    sl3 = SalesListing(
        unit_id=u3.unit_id,
        platform="eBay",
        target_price=150.00,
        listing_url="https://www.ebay.co.uk/itm/nad-302-stereo-amp",
        final_sale_price=140.00,
        platform_fees=15.26,
        shipping_costs=8.99,
        is_active=False
    )
    db.add(sl3)

    # Unit 4: Pro-Ject T1 Phono SB (Turntable) - Triage
    u4 = InventoryUnit(
        brand="Pro-Ject",
        model_number="T1 Phono SB",
        serial_number="SN-882190",
        category="Turntable",
        acquisition_source="Facebook Marketplace",
        base_cost=80.00,
        cosmetic_condition="Good",
        system_status="Triage"
    )
    db.add(u4)
    db.flush()

    r4 = RepairLog(
        unit_id=u4.unit_id,
        priority=3,
        initial_symptoms="Motor spins, but integrated phono stage output is dead on right channel. Needs multimeter signal trace.",
        action_plan="Check internal preamp PCB connections and RCA cable continuity.",
        bench_notes="Visual check shows no blown components. Continuity test planned on tonearm wires."
    )
    db.add(r4)

    # Unit 5: Marantz 2270 (Receiver) - Ready to Sell
    u5 = InventoryUnit(
        brand="Marantz",
        model_number="2270",
        serial_number="SN-449120",
        category="Receiver",
        acquisition_source="Estate Sale",
        base_cost=120.00,
        cosmetic_condition="Mint",
        system_status="Ready to Sell"
    )
    db.add(u5)
    db.flush()

    r5 = RepairLog(
        unit_id=u5.unit_id,
        priority=1,
        initial_symptoms="Tuner lamps dark. DC offset out of spec on channel B.",
        action_plan="Replace dial fuse lamps with cool blue LEDs. Adjust bias & offset trimpots.",
        bench_notes="LED upgrade complete. DC offset calibrated to 0.5mV on both channels. Sounds lush and clean!"
    )
    db.add(r5)

    p5 = PartOrder(
        unit_id=u5.unit_id,
        description="LED Fuse Lamp Kit (8V)",
        supplier="eBay",
        cost=14.00,
        order_status="Installed",
        eta_date=date(2026, 8, 4)
    )
    db.add(p5)

    sl5 = SalesListing(
        unit_id=u5.unit_id,
        platform="Reverb",
        target_price=550.00,
        listing_url="https://reverb.com/item/marantz-2270-vintage-receiver",
        is_active=True
    )
    db.add(sl5)

    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
