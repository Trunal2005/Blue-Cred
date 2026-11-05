export interface Project {
  id: string;
  name: string;
  location: string;
  type: "Mangrove" | "Seagrass" | "Salt Marsh";
  creditsIssued: number;
  availableCredits: number;
  pricePerCredit: number;
  status: "Pending" | "Verified" | "Rejected" | "Minted" | "Approved";
  area: string;
  biomass: string;
  submittedBy: string;
  organizationName?: string;
  organizationType?: string;
  date: string;
  image: string;
  ipfsHash: string;
  latitude?: number;
  longitude?: number;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Sundarbans Mangrove Restoration",
    location: "West Bengal, India",
    type: "Mangrove",
    creditsIssued: 12500,
    availableCredits: 8500,
    pricePerCredit: 2100, // INR
    status: "Approved",
    area: "500 Hectares",
    biomass: "15,000 Tons",
    submittedBy: "EcoRestor NGO",
    organizationName: "EcoRestor India",
    organizationType: "NGO",
    date: "2024-01-15",
    image: "https://images.unsplash.com/photo-1544526226-d4568090ffb8?auto=format&fit=crop&w=400&h=250",
    ipfsHash: "QmXoyp...3n8"
  },
  {
    id: "2",
    name: "Gulf of Mannar Seagrass Recovery",
    location: "Tamil Nadu, India",
    type: "Seagrass",
    creditsIssued: 0,
    availableCredits: 0,
    pricePerCredit: 1850, // INR
    status: "Pending",
    area: "120 Hectares",
    biomass: "4,200 Tons",
    submittedBy: "OceanHealth India",
    date: "2024-02-10",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=250",
    ipfsHash: "QmYtr8...9q2"
  },
  {
    id: "3",
    name: "Pichavaram Mangrove Conservation",
    location: "Tamil Nadu, India",
    type: "Mangrove",
    creditsIssued: 35000,
    availableCredits: 12000,
    pricePerCredit: 2500, // INR
    status: "Approved",
    area: "800 Hectares",
    biomass: "28,000 Tons",
    submittedBy: "GlobalGreen",
    organizationName: "GlobalGreen India",
    organizationType: "Private Project",
    date: "2023-11-20",
    image: "https://images.unsplash.com/photo-1588666309990-d68f08e3d816?auto=format&fit=crop&w=400&h=250",
    ipfsHash: "QmZlk2...1p5"
  },
  {
    id: "4",
    name: "Andaman Coastal Marshes",
    location: "Andaman & Nicobar Islands, India",
    type: "Salt Marsh",
    creditsIssued: 0,
    availableCredits: 0,
    pricePerCredit: 1500, // INR
    status: "Rejected",
    area: "300 Hectares",
    biomass: "9,000 Tons",
    submittedBy: "EuroNature India",
    date: "2024-03-01",
    image: "https://images.unsplash.com/photo-1518173946687-a4c8a9ba25ef?auto=format&fit=crop&w=400&h=250",
    ipfsHash: "QmWvq1...4m3"
  }
];

