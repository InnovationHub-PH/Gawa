// Fabrication data - sample data for machines and materials
export const fabricationItems = [
  {
    id: 1,
    name: '3D Printer - Prusa i3 MK3S+',
    type: 'machine',
    category: '3d-printer',
    owner: 'TechLabs Manila',
    location: {
      lat: 14.5547,
      lng: 120.9947,
      address: 'Makati City, Philippines'
    },
    availability: 'available',
    hourlyRate: 150,
    description: 'High-quality FDM 3D printer capable of printing PLA, PETG, and ABS materials. Build volume: 250×210×210mm.',
    contact: 'contact@techlabs.ph',
    image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
    tags: ['3d-printing', 'prototyping', 'fdm']
  },
  {
    id: 2,
    name: 'Laser Cutter - Epilog Zing 24',
    type: 'machine',
    category: 'laser-cutter',
    owner: 'Innovation Labs',
    location: {
      lat: 14.5580,
      lng: 120.9890,
      address: 'BGC, Taguig City, Philippines'
    },
    availability: 'available',
    hourlyRate: 300,
    description: 'CO2 laser cutter for wood, acrylic, paper, and fabric. Cutting area: 610×305mm, 30W laser.',
    contact: 'info@innovationlabs.ph',
    image: 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg',
    tags: ['laser-cutting', 'engraving', 'prototyping']
  },
  {
    id: 3,
    name: 'CNC Mill - Haas Mini Mill',
    type: 'machine',
    category: 'cnc-mill',
    owner: 'Precision Works',
    location: {
      lat: 14.5648,
      lng: 120.9932,
      address: 'Manila, Philippines'
    },
    availability: 'busy',
    hourlyRate: 500,
    description: 'Precision CNC milling machine for aluminum, steel, and plastic parts. 3-axis machining.',
    contact: 'orders@precisionworks.ph',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
    tags: ['cnc', 'machining', 'metal-working']
  },
  {
    id: 4,
    name: 'PLA Filament - Various Colors',
    type: 'material',
    category: 'filament',
    owner: 'Maker Supply Co.',
    location: {
      lat: 14.5695,
      lng: 120.9822,
      address: 'Quezon City, Philippines'
    },
    availability: 'available',
    price: 25,
    unit: 'per kg',
    description: 'High-quality PLA filament in multiple colors. Diameter: 1.75mm. Perfect for 3D printing.',
    contact: 'sales@makersupply.ph',
    image: 'https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg',
    tags: ['3d-printing', 'filament', 'pla']
  },
  {
    id: 5,
    name: 'Acrylic Sheets - Clear & Colored',
    type: 'material',
    category: 'acrylic',
    owner: 'Plastic Solutions',
    location: {
      lat: 14.5542,
      lng: 120.9965,
      address: 'Pasig City, Philippines'
    },
    availability: 'available',
    price: 120,
    unit: 'per sheet',
    description: 'High-grade acrylic sheets, 3mm thickness. Available in clear and various colors. Perfect for laser cutting.',
    contact: 'info@plasticsolutions.ph',
    image: 'https://images.pexels.com/photos/6069112/pexels-photo-6069112.jpeg',
    tags: ['laser-cutting', 'acrylic', 'sheets']
  },
  {
    id: 6,
    name: 'Arduino Starter Kit',
    type: 'material',
    category: 'electronics',
    owner: 'Electronics Hub',
    location: {
      lat: 14.5907,
      lng: 120.9748,
      address: 'Manila, Philippines'
    },
    availability: 'available',
    price: 1500,
    unit: 'per kit',
    description: 'Complete Arduino starter kit with Uno R3, breadboard, sensors, LEDs, resistors, and jumper wires.',
    contact: 'support@electronicshub.ph',
    image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg',
    tags: ['electronics', 'arduino', 'prototyping']
  }
];

// Machine categories
export const machineCategories = [
  { value: '3d-printer', label: '3D Printers' },
  { value: 'laser-cutter', label: 'Laser Cutters' },
  { value: 'cnc-mill', label: 'CNC Mills' },
  { value: 'cnc-router', label: 'CNC Routers' },
  { value: 'vinyl-cutter', label: 'Vinyl Cutters' },
  { value: 'soldering-station', label: 'Soldering Stations' },
  { value: 'oscilloscope', label: 'Oscilloscopes' },
  { value: 'multimeter', label: 'Multimeters' }
];

// Material categories
export const materialCategories = [
  { value: 'filament', label: 'Filaments' },
  { value: 'acrylic', label: 'Acrylic Sheets' },
  { value: 'wood', label: 'Wood' },
  { value: 'metal', label: 'Metal Stock' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'foam', label: 'Foam' },
  { value: 'adhesives', label: 'Adhesives' }
];