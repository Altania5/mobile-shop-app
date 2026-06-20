// Static marketing content for the public site. The old MongoDB "services
// catalog" is retired; service descriptions live here as code.

export const PHONE = "(484) 593-3875";
export const PHONE_HREF = "tel:4845933875";
export const RATE = "$80/hr";
export const AREA = "Chester, Delaware & Montgomery Counties, PA";

export type ServiceOverview = {
  icon: string; // Font Awesome class
  title: string;
  desc: string;
  slug: string;
};

export const SERVICES: ServiceOverview[] = [
  { icon: "fa-solid fa-microchip", title: "Vehicle Diagnostics", desc: "Check engine light on? We bring professional OBD-II diagnostic tools to your location and explain exactly what's wrong.", slug: "diagnostics" },
  { icon: "fa-solid fa-circle-dot", title: "Brake Repair", desc: "Squealing, grinding, or a soft pedal? Pads, rotors, calipers, and brake fluid — all handled on-site.", slug: "brakes" },
  { icon: "fa-solid fa-gear", title: "Engine Repair", desc: "Misfires, overheating, timing belts, head gaskets — most engine repairs done right in your driveway.", slug: "engine-repair" },
  { icon: "fa-solid fa-oil-can", title: "Scheduled Maintenance", desc: "Stay on your manufacturer schedule without a shop visit. Tune-ups, fluid flushes, filters, and more.", slug: "maintenance" },
  { icon: "fa-solid fa-car-side", title: "Suspension Repair", desc: "Clunking, rough ride, or pulling? Struts, ball joints, tie rods, and control arms replaced on-site.", slug: "suspension" },
  { icon: "fa-solid fa-bolt", title: "Electrical Repair", desc: "Dead battery, bad alternator, wiring faults — we diagnose and fix electrical problems wherever your car is.", slug: "electrical" },
];

// Default service label pre-selected in the booking form on each landing page.
export const SERVICE_LABELS: Record<string, string> = {
  diagnostics: "Vehicle Diagnostics / Check Engine Light",
  brakes: "Brake Repair",
  "engine-repair": "Engine Repair",
  maintenance: "Scheduled Maintenance",
  suspension: "Suspension Repair",
  electrical: "Electrical Repair",
};

export type ServiceDetail = {
  eyebrow: string;
  headline: [string, string];
  subheadline: string;
  services: { icon: string; title: string; desc: string }[];
};

export const SERVICE_DATA: Record<string, ServiceDetail> = {
  diagnostics: {
    eyebrow: "Mobile Vehicle Diagnostics",
    headline: ["Check Engine Light On? ", "We Come to You."],
    subheadline:
      "Don't guess — get a proper diagnostic at your home or office. We read your fault codes, explain exactly what's wrong, and give you honest, upfront pricing before any repair begins.",
    services: [
      { icon: "fa-solid fa-microchip", title: "OBD-II Fault Code Scan", desc: "Full computer scan to read every stored and pending code across all vehicle systems." },
      { icon: "fa-solid fa-triangle-exclamation", title: "Warning Light Diagnosis", desc: "Check engine, ABS, airbag, TPMS, and other dashboard warning lights identified and explained." },
      { icon: "fa-solid fa-bolt", title: "Electrical Fault Diagnosis", desc: "Pinpoint the root cause of electrical gremlins using professional-grade diagnostic tools." },
      { icon: "fa-solid fa-magnifying-glass", title: "Pre-Purchase Inspection", desc: "Buying a used car? Have us inspect it at the seller's location before you commit." },
      { icon: "fa-solid fa-temperature-high", title: "Overheating & Cooling System", desc: "Diagnose overheating causes — thermostat, water pump, head gasket, and beyond." },
      { icon: "fa-solid fa-gauge-high", title: "Performance & Drivability", desc: "Misfires, rough idle, hesitation — we track down the cause and lay out your options." },
    ],
  },
  brakes: {
    eyebrow: "Mobile Brake Repair",
    headline: ["Brake Problems? ", "Fixed On-Site."],
    subheadline:
      "Squealing, grinding, or a soft pedal? Don't risk it. Our mobile mechanic comes to your home or workplace and handles your full brake service right there — no tow, no shop wait.",
    services: [
      { icon: "fa-solid fa-circle-dot", title: "Brake Pad Replacement", desc: "Quality pads installed on all four corners. We carry a range of pad grades to fit your needs and budget." },
      { icon: "fa-solid fa-compact-disc", title: "Rotor Replacement", desc: "Warped or worn rotors replaced for smooth, vibration-free braking." },
      { icon: "fa-solid fa-grip-lines", title: "Caliper Service & Replacement", desc: "Sticking or seized calipers diagnosed and replaced to restore even braking pressure." },
      { icon: "fa-solid fa-droplet", title: "Brake Fluid Flush", desc: "Old, moisture-contaminated fluid replaced to restore proper pedal feel and protect the system." },
      { icon: "fa-solid fa-ruler", title: "Brake Line Inspection", desc: "Visual inspection of all brake lines and hoses for leaks, rust, or damage." },
      { icon: "fa-solid fa-magnifying-glass", title: "Full Brake Inspection", desc: "Not sure what's wrong? We inspect the entire brake system and give you a straight answer." },
    ],
  },
  "engine-repair": {
    eyebrow: "Mobile Engine Repair",
    headline: ["Engine Trouble? ", "We Fix It at Your Location."],
    subheadline:
      "Most engine repairs don't need a full shop — they need the right tools and a knowledgeable mechanic. We bring both to your driveway at a fair $80/hr labor rate.",
    services: [
      { icon: "fa-solid fa-fire-flame-curved", title: "Misfire Diagnosis & Repair", desc: "Rough running, shaking, or check engine flashing? We pinpoint and fix the cylinder causing trouble." },
      { icon: "fa-solid fa-droplet", title: "Head Gasket Repair", desc: "Coolant loss, white smoke, or milky oil? We diagnose and repair blown head gaskets on-site." },
      { icon: "fa-solid fa-gear", title: "Timing Belt & Chain Service", desc: "Prevent catastrophic engine damage with timely timing belt or chain replacement." },
      { icon: "fa-solid fa-oil-can", title: "Valve Cover Gasket", desc: "Oil leaking from the top of your engine? Valve cover gaskets replaced quickly on-site." },
      { icon: "fa-solid fa-temperature-arrow-up", title: "Cooling System Repair", desc: "Thermostat, water pump, radiator hoses, and coolant flushes — all handled at your location." },
      { icon: "fa-solid fa-plug", title: "Spark Plugs & Ignition", desc: "Worn plugs, bad coils, or faulty wires — full ignition system service for peak performance." },
    ],
  },
  maintenance: {
    eyebrow: "Scheduled Maintenance",
    headline: ["Keep Your Car Running Right ", "Without Leaving Home."],
    subheadline:
      "Stay on your manufacturer's maintenance schedule without the wait room. We come to your home or office and handle your routine service right there — no appointment hassle, no shop markup.",
    services: [
      { icon: "fa-solid fa-plug", title: "Tune-Up & Spark Plugs", desc: "Fresh spark plugs, new ignition components, and a full tune-up to restore performance and fuel economy." },
      { icon: "fa-solid fa-wind", title: "Air & Cabin Filter Replacement", desc: "Engine air filter and cabin air filter inspected and replaced to keep air clean inside and out." },
      { icon: "fa-solid fa-droplet", title: "Coolant Flush", desc: "Old coolant drained and refilled to protect your engine from overheating and corrosion." },
      { icon: "fa-solid fa-car-burst", title: "Brake Fluid Service", desc: "Moisture-laden brake fluid replaced to maintain pedal feel and protect your braking system." },
      { icon: "fa-solid fa-battery-full", title: "Battery Inspection & Replacement", desc: "Battery tested and replaced if needed — before it leaves you stranded." },
      { icon: "fa-solid fa-road", title: "Belts & Hoses Inspection", desc: "Serpentine belt, drive belts, and coolant hoses inspected and replaced to prevent breakdowns." },
    ],
  },
  suspension: {
    eyebrow: "Mobile Suspension Repair",
    headline: ["Rough Ride or Clunking? ", "We Fix It On-Site."],
    subheadline:
      "Suspension problems get worse fast and affect your safety, tire wear, and handling. Our mobile mechanic diagnoses and repairs suspension components at your location across Southeast PA.",
    services: [
      { icon: "fa-solid fa-car-side", title: "Strut & Shock Replacement", desc: "Worn struts and shocks replaced to restore ride quality, handling, and safety." },
      { icon: "fa-solid fa-circle-nodes", title: "Ball Joint Replacement", desc: "Clunking or wandering steering? Ball joints inspected and replaced before they fail completely." },
      { icon: "fa-solid fa-arrows-left-right", title: "Tie Rod Replacement", desc: "Inner and outer tie rod ends replaced to restore steering precision and eliminate play." },
      { icon: "fa-solid fa-arrows-to-dot", title: "Control Arm Replacement", desc: "Upper and lower control arms and bushings replaced to correct handling and alignment." },
      { icon: "fa-solid fa-link", title: "Sway Bar Links & Bushings", desc: "Clunking over bumps or in turns? Sway bar links and bushings replaced quickly on-site." },
      { icon: "fa-solid fa-circle", title: "Wheel Bearing Replacement", desc: "Humming or grinding at speed? Wheel bearings diagnosed and replaced before they cause damage." },
    ],
  },
  electrical: {
    eyebrow: "Mobile Auto Electrical Repair",
    headline: ["Electrical Problems? ", "We Diagnose & Fix On-Site."],
    subheadline:
      "From a dead battery to complex wiring faults, our mobile mechanic brings professional electrical diagnostic tools directly to you — no tow truck required.",
    services: [
      { icon: "fa-solid fa-battery-full", title: "Battery Replacement", desc: "Battery tested and replaced with a quality unit, right in your driveway." },
      { icon: "fa-solid fa-bolt-lightning", title: "Alternator Replacement", desc: "Battery warning light or frequent dead batteries? Alternator tested and replaced if failing." },
      { icon: "fa-solid fa-power-off", title: "Starter Replacement", desc: "Click with no crank? Starter motor tested and replaced so your car starts reliably again." },
      { icon: "fa-solid fa-diagram-project", title: "Wiring Diagnosis & Repair", desc: "Short circuits, open circuits, and damaged wiring tracked down and repaired properly." },
      { icon: "fa-solid fa-sliders", title: "Fuse, Relay & Module Diagnosis", desc: "Failing relays and blown fuses identified and corrected — no guesswork." },
      { icon: "fa-solid fa-microchip", title: "Sensor Replacement", desc: "O2 sensors, MAF sensors, crankshaft position sensors, and more replaced on-site." },
    ],
  },
};
