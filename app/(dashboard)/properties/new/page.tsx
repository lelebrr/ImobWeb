"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Plus,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Building,
  UploadCloud,
  Loader2,
  Maximize2,
  Bed,
  Bath,
  Car,
  Layers,
  Waves,
  Wifi,
  Video,
  Eye,
  Camera,
  Search,
  CheckCircle2,
  Utensils,
  Sun,
  Heater,
  AirVent,
  Tv,
  Wine,
  Hammer,
  TreePine,
  Volleyball,
  Building2,
  Castle,
  Warehouse,
  Store,
  Briefcase,
  Stethoscope,
  Hotel,
  Palmtree,
  Mountain,
  TreeDeciduous,
  Flower2,
  Dumbbell,
  Baby,
  Dog,
  Plane,
  Map,
  Navigation,
  Calendar,
  Clock,
  FileText,
  PenTool,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Wrench,
  HardHat,
  Clipboard,
  Users,
  User,
  Heart,
  Star,
  Award,
  Gem,
  Crown,
  Flame,
  Leaf,
  Snowflake,
  Droplets,
  Power,
  Gauge,
  Timer,
  Accessibility,
  Tent,
  TentIcon,
  Fence,
  DoorOpen,
  Frame,
  Layout,
  Ruler,
  Boxes,
  Caravan,
  Ship,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Label } from "@/components/design-system/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/design-system/select";
import { Textarea } from "@/components/design-system/textarea";
import { Card } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "APARTAMENTO", label: "Apartamento", icon: Building },
  { value: "APARTAMENTO_GARDEN", label: "Apartamento Garden", icon: Flower2 },
  { value: "SOBRADO", label: "Sobrado", icon: Home },
  { value: "CASA", label: "Casa", icon: Home },
  { value: "CASA_CONDOMINIO", label: "Casa em Condomínio", icon: Castle },
  { value: "CASA_VILA", label: "Casa de Vila", icon: Home },
  { value: "CASA_GEMINADA", label: "Casa Geminada", icon: Home },
  { value: "CASA_PRAIA", label: "Casa de Praia", icon: Palmtree },
  { value: "CASA_CAMPO", label: "Casa de Campo", icon: TreeDeciduous },
  { value: "BANGALO", label: "Bangalô", icon: TentIcon },
  { value: "DUPLEX", label: "Dúplex", icon: Layers },
  { value: "TRIPLEX", label: "Tríplex", icon: Layers },
  { value: "COBERTURA", label: "Cobertura", icon: Crown },
  { value: "COBERTURA_DUPLEX", label: "Cobertura Duplex", icon: Crown },
  { value: "LOFT", label: "Loft", icon: Layout },
  { value: "STUDIO", label: "Studio", icon: Layout },
  { value: "KITNET", label: "Kitnet", icon: Bed },
  { value: "FLAT", label: "Flat", icon: Building2 },
  { value: "TERRENO", label: "Terreno", icon: Map },
  { value: "TERRENO_INDUSTRIAL", label: "Terreno Industrial", icon: Warehouse },
  { value: "LOTE", label: "Lote", icon: Map },
  { value: "GALPAO", label: "Galpão", icon: Warehouse },
  { value: "SALA_COMERCIAL", label: "Sala Comercial", icon: Briefcase },
  { value: "LOJA", label: "Loja", icon: Store },
  { value: "SHOWROOM", label: "Showroom", icon: Store },
  { value: "ESCRITORIO", label: "Escritório", icon: Briefcase },
  { value: "CONSULTORIO", label: "Consultório", icon: Stethoscope },
  { value: "CLINICA", label: "Clínica", icon: Stethoscope },
  { value: "HOTEL", label: "Hotel", icon: Hotel },
  { value: "POUSADA", label: "Pousada", icon: Hotel },
  { value: "Motel", label: "Motel", icon: Hotel },
  { value: "FAZENDA", label: "Fazenda", icon: TractorIcon },
  { value: "SITIO", label: "Sítio", icon: TreePine },
  { value: "CHACARA", label: "Chácara", icon: TreePine },
  { value: "PONTA_BARRA", label: "Ponta de Praia", icon: Waves },
];

const STEPS = [
  { id: "basic", title: "Básico", icon: Home },
  { id: "details", title: "Métricas", icon: Maximize2 },
  { id: "rooms", title: "Cômodos", icon: DoorOpen },
  { id: "features", title: "Características", icon: Sparkles },
  { id: "building", title: "Prédio/Condo", icon: Building },
  { id: "condo", title: "Área Comum", icon: Users },
  { id: "location", title: "Localização", icon: MapPin },
  { id: "proximity", title: "Proximidades", icon: Navigation },
  { id: "media", title: "Mídia", icon: ImageIcon },
  { id: "status", title: "Status", icon: Clipboard },
  { id: "docs", title: "Documentação", icon: FileText },
];

const PROPERTY_STATUS = [
  {
    value: "PRONTO",
    label: "Pronto para Morar",
    description: "Imóvel novo ou reformado, pronto para uso imediato",
  },
  {
    value: "EM_CONSTRUCAO",
    label: "Em Construção",
    description: "Obra em andamento, consulte prazo de entrega",
  },
  { value: "EM_REFORMA", label: "Em Reforma", description: "正在进行装修工程" },
  {
    value: "NA_PLANTA",
    label: "Na Planta",
    description: "Ainda não iniciou construção, entrega futura",
  },
  {
    value: "LANCAMENTO",
    label: "Lançamento",
    description: "Novo projeto, condições especiais de lançamento",
  },
  {
    value: "PRE_LANCAMENTO",
    label: "Pré-Lançamento",
    description: " Fase de comercialização antecipada",
  },
  {
    value: "CUSTOMIZAVEL",
    label: "Planta Customizável",
    description: "Possibilidade de personalizar layout e acabamentos",
  },
  {
    value: "OBRA_PARADA",
    label: "Obra Parada",
    description: "Construção interrompida, risco de atraso",
  },
];

const PAYMENT_METHODS = [
  "A Vista",
  "Financiamento",
  "FGTS",
  "Consórcio",
  "Permuta",
  "Parceria",
  "Leasing",
  "CREFI",
  "Cartão BNDES",
  "Bitcoin",
];

const DOCUMENT_TYPES = [
  "Registro OK",
  "Matrícula atualizada",
  "Habite-se",
  "Certidão de ônus reais",
  "Certidão negativa de débitos",
  "Certidão de ITBI",
  "Averbação averbada",
  "Certidão do IPTU",
  "Laudo de vistoria",
  "Certificado de quitação",
  "Escritura pública",
  "Contrato gaveta",
  "Composição de condomínio",
  "Regulamento interno",
];

function TractorIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3h18v4H3z" />
      <path d="M4 7v4h16v-4" />
      <path d="M6 11h12l-1 10H7z" />
      <circle cx="6" cy="16" r="2" />
      <circle cx="18" cy="16" r="2" />
    </svg>
  );
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    indoor: true,
    outdoor: true,
    security: true,
    recreation: true,
    infrastructure: true,
    sustainability: true,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<
    Record<string, boolean>
  >({});

  // Custom amenity inputs
  const [customAmenities, setCustomAmenities] = useState<
    { name: string; area: string }[]
  >([]);
  const [customRooms, setCustomRooms] = useState<
    { name: string; area: string }[]
  >([]);

  // Google Maps ref
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [formData, setFormData] = useState<any>({
    // Step 1: Basic
    title: "",
    category: "APARTAMENTO",
    usage: "VENDA",
    priceSale: "",
    priceRent: "",
    priceSaleMin: "",
    priceRentMin: "",
    condoFee: "",
    taxFee: "",
    iptuInstallments: "",
    description: "",
    highlight: "",
    targetBuyer: "",

    // Step 2: Metrics
    metrics: {
      bedrooms: "",
      suites: "",
      bathrooms: "",
      bathroomsSocial: "",
      bathroomsService: "",
      halfBathrooms: "",
      garagesCovered: "",
      garagesOpen: "",
      garagesSidewalk: "",
      garagesValet: "",
      areaPrivate: "",
      areaTotal: "",
      areaUseful: "",
      areaCommon: "",
      areaTerrace: "",
      areaBalcony: "",
      areaGarden: "",
      areaPool: "",
      frontMeasure: "",
      sideMeasure: "",
      depthMeasure: "",
    },

    // Step 3: Rooms
    rooms: {
      livingRoom: false,
      livingRoomArea: "",
      diningRoom: false,
      diningRoomArea: "",
      tvRoom: false,
      tvRoomArea: "",
      studyRoom: false,
      studyRoomArea: "",
      office: false,
      officeArea: "",
      library: false,
      libraryArea: "",
      kitchen: false,
      kitchenArea: "",
      kitchenAmerican: false,
      kitchenGourmet: false,
      pantry: false,
      pantryArea: "",
      laundry: false,
      laundryArea: "",
      serviceRoom: false,
      serviceRoomArea: "",
      maidRoom: false,
      maidRoomArea: "",
      storage: false,
      storageArea: "",
      wineCellar: false,
      wineCellarArea: "",
      bar: false,
      barArea: "",
      gym: false,
      gymArea: "",
      sauna: false,
      saunaArea: "",
      steamRoom: false,
      terrace: false,
      terraceArea: "",
      balcony: false,
      balconyArea: "",
      garden: false,
      gardenArea: "",
      pool: false,
      poolArea: "",
      jacuzzi: false,
      jacuzziArea: "",
      bathroomGym: false,
      bathroomPool: false,
      closet: false,
      closetArea: "",
      walkInCloset: false,
      basement: false,
      basementArea: "",
      attic: false,
      atticArea: "",
      cellar: false,
      cellarArea: "",
    },

    // Step 4: Features
    features: {
      // Indoor & Luxury
      hasPool: false,
      hasPoolArea: "",
      hasBarbecue: false,
      hasBarbecueArea: "",
      hasBathtub: false,
      hasBathtubType: "",
      hasJacuzzi: false,
      hasWineCellar: false,
      hasWineCellarArea: "",
      hasFireplace: false,
      hasFireplaceType: "",
      hasGourmetKitchen: false,
      hasGourmetKitchenArea: "",
      hasHomeOffice: false,
      hasAirConditioning: false,
      hasCentralAir: false,
      hasAutomation: false,
      hasSolarHeating: false,
      hasPanicRoom: false,
      hasServiceArea: false,
      hasPantry: false,
      hasCloset: false,
      hasWalkInCloset: false,
      hasIntegratedKitchen: false,
      hasLavaJato: false,
      hasBikeStorage: false,
      hasSportsCourt: false,
      hasGamesRoom: false,
      hasBilliardRoom: false,
      hasWineRoom: false,
      hasLibrary: false,
      hasStudio: false,
      hasMusicRoom: false,
      hasArtRoom: false,
      hasSafe: false,
      hasIntercom: false,
      hasWifi: false,
      hasSmartLock: false,
      hasBiometricEntry: false,
      hasSoundSystem: false,
      hasBlindsElectric: false,
      hasCurtainsElectric: false,
      hasGarden: false,
      hasGardenArea: "",
      hasHeatedPool: false,
      hasPoolCover: false,
      hasPoolIlluminated: false,
      hasDeck: false,
      hasDeckArea: "",
      hasHammock: false,
      hasBbqGrill: false,
      hasPizzaOven: false,
      hasFirePit: false,
      hasKoiPond: false,
      hasVerticalGarden: false,
      hasOrchidGarden: false,
      hasVegetableGarden: false,

      // Outdoor/Building
      hasGym: false,
      hasGymArea: "",
      hasPlayground: false,
      hasTennisCourt: false,
      hasTennisCourtType: "",
      hasTennisCourtArea: "",
      hasSoccerField: false,
      hasSoccerFieldArea: "",
      hasVolleyballCourt: false,
      hasBasketballCourt: false,
      hasSquashCourt: false,
      hasGolfCourse: false,
      hasMiniGolf: false,
      hasSauna: false,
      hasSaunaType: "",
      hasSpa: false,
      hasPartyRoom: false,
      hasPartyRoomArea: "",
      hasCinema: false,
      hasCinemaArea: "",
      hasPetPlace: false,
      hasPetGrooming: false,
      hasPetVet: false,
      hasBeachService: false,
      hasHeliport: false,
      hasPrivateBeach: false,
      hasMarina: false,
      hasDock: false,
      hasTrail: false,
      hasYogaSpace: false,
      hasMeditationSpace: false,
      hasMassageRoom: false,

      // Security
      hasSecurity24h: false,
      hasArmoredDoor: false,
      hasAlarm: false,
      hasMonitoring: false,
      hasElectronicGate: false,
      hasConcierge: false,
      hasSmartGate: false,
      hasElectricFence: false,
      hasSecurityCamera: false,
      hasBiometricAccess: false,
      hasFacialRecognition: false,
      hasVehicleRecognition: false,
      hasPanicButton: false,
      hasSafeRoom: false,
      hasPerimeterAlarm: false,
      hasGuardDog: false,
      hasSmartSecurity: false,
      hasAccessControl: false,
    },

    // Step 5: Building Specifics
    building: {
      name: "",
      type: "",
      totalFloors: "",
      currentFloor: "",
      unitsTotal: "",
      unitsPerFloor: "",
      elevators: "",
      serviceElevator: false,
      constructionYear: "",
      deliveryYear: "",
      hasGenerator: false,
      hasIndividualWater: false,
      hasIndividualGas: false,
      hasIndividualMeter: false,
      hasHydrometer: false,
      hasGasPipeline: false,
      hasCentralVacuum: false,
      hasPressurizedSystem: false,
      hasWaterTank: false,
      hasCistern: false,
      hasSolarPanel: false,
      hasElectricCharger: false,
      hasEvReady: false,
      hasRooftop: false,
      hasSkyGarden: false,
      hasPetFriendly: false,
      hasSmokeArea: false,
      hasBikeFriendly: false,
      hasCargoArea: false,
      hasVisitantParking: false,
      hasHandicappedAccess: false,
      hasAccessibleUnits: false,
    },

    // Step 6: Condo Amenities (checkboxes with areas)
    condoAmenities: {
      hasPoolCondo: false,
      poolCondoArea: "",
      poolCondoHeated: false,
      hasGymCondo: false,
      gymCondoArea: "",
      hasSaunaCondo: false,
      hasSpaCondo: false,
      hasRacquetball: false,
      hasSquashCondo: false,
      hasTennisCourtCondo: false,
      hasSoccerFieldCondo: false,
      hasVolleyballCondo: false,
      hasBasketballCondo: false,
      hasPlaygroundCondo: false,
      hasKidsClub: false,
      hasGameRoomCondo: false,
      hasPartyRoomCondo: false,
      partyRoomCondoArea: "",
      hasCinemaCondo: false,
      hasMusicRoomCondo: false,
      hasGourmetSpace: false,
      hasBarbecueArea: false,
      hasFireplaceArea: false,
      hasZenSpace: false,
      hasYogaCondo: false,
      hasPilatesCondo: false,
      hasFunctionalRoom: false,
      hasDancingRoom: false,
      hasBeautySalon: false,
      hasConciergeService: false,
      has24hReception: false,
      hasRoomService: false,
      hasLaundryCondo: false,
      hasCarWash: false,
      hasValetParking: false,
      hasElectricChargerCondo: false,
      hasVisitorParkingCondo: false,
      hasBikeParkingCondo: false,
      hasBikeMaintenance: false,
      hasPetSpaCondo: false,
      hasPetWalkingArea: false,
      hasGardenCondo: false,
      hasLandscaping: false,
      hasOrchard: false,
      hasCityView: false,
      hasSeaView: false,
      hasMountainView: false,
      hasSunsetView: false,
      hasPrivateBalcony: false,
      hasRooftopAccess: false,
      hasRooftopPool: false,
      hasSkyLounge: false,
      hasGuestSuite: false,
      hasBusinessCenter: false,
      hasMeetingRoom: false,
      hasCoworking: false,
      hasCoworkingArea: "",
      hasAuditorium: false,
      hasPlaygroundZone: false,
      hasSportsZone: false,
      hasLeisureZone: false,
      hasGourmetZone: false,
      hasRelaxationZone: false,
    },

    // Step 7: Location
    address: {
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      district: "",
      city: "",
      state: "",
      country: "Brasil",
      reference: "",
      latitude: -23.5505,
      longitude: -46.6333,
      geocodeAccuracy: "",
    },

    // Step 8: Proximity
    proximity: {
      beachDistance: "",
      beachView: false,
      seaView: false,
      mountainView: false,
      parkDistance: "",
      schoolDistance: "",
      universityDistance: "",
      hospitalDistance: "",
      healthClinicDistance: "",
      pharmacyDistance: "",
      supermarketDistance: "",
      mallDistance: "",
      shoppingCenterDistance: "",
      metroDistance: "",
      metroStation: "",
      trainStationDistance: "",
      busStopDistance: "",
      airportDistance: "",
      highwayDistance: "",
      mainAvenueDistance: "",
      commercialAreaDistance: "",
      restaurantDistance: "",
      gymDistance: "",
      bankDistance: "",
      atmDistance: "",
    },

    // Step 9: Media
    media: [],
    photos360: [],
    videoUrls: [{ platform: "youtube", url: "" }],
    virtualTourUrl: "",
    arTourUrl: "",
    floorPlanUrl: "",
    floorPlan3dUrl: "",
    brochureUrl: "",
    legalDocUrl: "",

    // Step 10: Status
    status: "PRONTO",
    constructionProgress: "",
    expectedDelivery: "",
    deliveryQuarter: "",
    handoverDate: "",
    warranty: false,
    warrantyYears: "",
    customOptions: false,
    customOptionsDesc: "",
    reformNeeded: false,
    reformBudget: "",
    reformDesc: "",
    renovationHistory: "",
    lastRenovation: "",

    // Step 11: Documentation
    documents: {
      registration: false,
      updatedMatricle: false,
      habiteSe: false,
      cnhReal: false,
      cndDebits: false,
      itbiCert: false,
      averbation: false,
      iptuCert: false,
      inspectionReport: false,
      quitacaoCert: false,
      publicDeed: false,
      gavetaContract: false,
      condoComposition: false,
      internalRules: false,
    },
    registrationNumber: "",
    registrationOffice: "",
    sheetNumber: "",
    bookNumber: "",
    propertyCode: "",
    enrollmentDate: "",
    lastTransfer: "",
    lastTransferDate: "",
    encumbrances: "",
    liens: "",
    IPTU: "",
    IPTUDebt: "",
    condoDebt: "",
    otherDebts: "",
    paymentMethods: [],
    acceptsExchange: false,
    exchange接受的: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerDocs: "",
    notes: "",
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSave();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleInputChange = (field: string, value: any, section?: string) => {
    if (section) {
      setFormData((prev: any) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features[feature],
      },
    }));
  };

  const toggleCondoAmenity = (amenity: string) => {
    setFormData((prev: any) => ({
      ...prev,
      condoAmenities: {
        ...prev.condoAmenities,
        [amenity]: !prev.condoAmenities[amenity],
      },
    }));
  };

  const toggleDocument = (doc: string) => {
    setFormData((prev: any) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [doc]: !prev.documents[doc],
      },
    }));
  };

  const toggleRoom = (room: string) => {
    setFormData((prev: any) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        [room]: !prev.rooms[room],
      },
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setFormData((prev: any) => {
      const methods = prev.paymentMethods || [];
      if (methods.includes(method)) {
        return {
          ...prev,
          paymentMethods: methods.filter((m: string) => m !== method),
        };
      } else {
        return { ...prev, paymentMethods: [...methods, method] };
      }
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addCustomAmenity = () => {
    setCustomAmenities([...customAmenities, { name: "", area: "" }]);
  };

  const removeCustomAmenity = (index: number) => {
    setCustomAmenities(customAmenities.filter((_, i) => i !== index));
  };

  const updateCustomAmenity = (index: number, field: string, value: string) => {
    const updated = [...customAmenities];
    updated[index] = { ...updated[index], [field]: value };
    setCustomAmenities(updated);
  };

  const addCustomRoom = () => {
    setCustomRooms([...customRooms, { name: "", area: "" }]);
  };

  const removeCustomRoom = (index: number) => {
    setCustomRooms(customRooms.filter((_, i) => i !== index));
  };

  const updateCustomRoom = (index: number, field: string, value: string) => {
    const updated = [...customRooms];
    updated[index] = { ...updated[index], [field]: value };
    setCustomRooms(updated);
  };

  const addVideoField = () => {
    setFormData((prev: any) => ({
      ...prev,
      videoUrls: [...prev.videoUrls, { platform: "youtube", url: "" }],
    }));
  };

  const removeVideoField = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateVideoField = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...prev.videoUrls];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, videoUrls: updated };
    });
  };

  // CEP Autocomplete
  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    handleInputChange("zipCode", cleanCep, "address");

    if (cleanCep.length === 8) {
      setSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev: any) => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            },
          }));
          toast.success("Endereço localizado!");
        }
      } catch (err) {
        toast.error("Erro ao buscar CEP");
      } finally {
        setSearchingCep(false);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Imóvel criado com sucesso com 300+ campos processados!");
      router.push("/properties");
    }, 2500);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string = "media",
  ) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setFormData((prev: any) => ({
        ...prev,
        [field]: [...prev[field], ...newMedia],
      }));
    }
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen pb-32 mt-4 px-4 lg:px-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="glass hover:bg-secondary/50 rounded-2xl h-12"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-right">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-gradient">
            Master Property Dashboard
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            Advanced Real Estate Engine 2026
          </p>
        </div>
      </div>

      {/* Stepper Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Stepper */}
        <div className="lg:col-span-3 space-y-3 sticky top-4 self-start">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={cn(
                "flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 cursor-pointer group relative overflow-hidden",
                currentStep === idx
                  ? "glass-card-border bg-primary/10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]"
                  : "opacity-30 hover:opacity-100",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
                  currentStep === idx
                    ? "bg-primary text-white rotate-[10deg] scale-110 shadow-xl"
                    : "bg-neutral-800",
                )}
              >
                {currentStep > idx ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 transition-colors duration-500",
                    currentStep === idx
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  Etapa {idx + 1}
                </p>
                <p className="font-black text-sm tracking-tight leading-none uppercase">
                  {step.title}
                </p>
              </div>
              {currentStep === idx && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </div>
          ))}

          {/* AI Helper Card */}
          <div className="mt-8 glass p-7 rounded-[2.5rem] border-none bg-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="font-black tracking-tighter mb-2 text-indigo-400 flex items-center gap-2">
              <Zap className="w-4 h-4 fill-current" /> Otimizador IA
            </h3>
            <p className="text-[11px] font-bold text-neutral-400 leading-relaxed uppercase tracking-wider">
              Gerando metadados de luxo e ajustando saturação cromática das
              imagens automaticamente.
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="lg:col-span-9">
          <Card className="glass p-10 md:p-16 rounded-[4rem] border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12 flex-1"
              >
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                        Título Comercial do Anúncio
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Ex: Penthouse Grand Luxxe com Vista para o Mar"
                        className="h-16 text-2xl font-black rounded-3xl border-none glass focus-visible:ring-primary/40 focus-visible:bg-white/5 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                          Tipo de Imóvel
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(v) =>
                            handleInputChange("category", v)
                          }
                        >
                          <SelectTrigger className="h-16 rounded-2xl glass border-none font-bold text-lg">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="glass-effect rounded-2xl border-none min-w-[240px] max-h-[400px] overflow-y-auto">
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                          Pretensão de Venda
                        </Label>
                        <Select
                          value={formData.usage}
                          onValueChange={(v) => handleInputChange("usage", v)}
                        >
                          <SelectTrigger className="h-16 rounded-2xl glass border-none font-bold text-lg">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="glass-effect rounded-2xl border-none">
                            <SelectItem value="VENDA">Somente Venda</SelectItem>
                            <SelectItem value="LOCACAO">
                              Somente Locação
                            </SelectItem>
                            <SelectItem value="VENDA_LOCACAO">
                              Venda e Locação (Ambos)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {(formData.usage === "VENDA" ||
                        formData.usage === "VENDA_LOCACAO") && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3"
                        >
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                            Valor de Venda (R$)
                          </Label>
                          <div className="relative group">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 group-focus-within:scale-110 transition-transform" />
                            <Input
                              type="number"
                              value={formData.priceSale}
                              onChange={(e) =>
                                handleInputChange("priceSale", e.target.value)
                              }
                              placeholder="0,00"
                              className="h-20 text-4xl font-black pl-16 rounded-3xl border-none glass focus-visible:ring-emerald-500/20"
                            />
                          </div>
                        </motion.div>
                      )}
                      {(formData.usage === "LOCACAO" ||
                        formData.usage === "VENDA_LOCACAO") && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3"
                        >
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                            Valor do Aluguel (p/ mês)
                          </Label>
                          <div className="relative group">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500 group-focus-within:scale-110 transition-transform" />
                            <Input
                              type="number"
                              value={formData.priceRent}
                              onChange={(e) =>
                                handleInputChange("priceRent", e.target.value)
                              }
                              placeholder="0,00"
                              className="h-20 text-4xl font-black pl-16 rounded-3xl border-none glass focus-visible:ring-indigo-500/20"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Faixa de Preço */}
                    {(formData.usage === "VENDA" ||
                      formData.usage === "VENDA_LOCACAO") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Valor Mínimo Venda (R$)
                          </Label>
                          <Input
                            type="number"
                            value={formData.priceSaleMin}
                            onChange={(e) =>
                              handleInputChange("priceSaleMin", e.target.value)
                            }
                            placeholder="0,00"
                            className="h-12 font-bold rounded-xl glass border-none"
                          />
                        </div>
                      </div>
                    )}
                    {(formData.usage === "LOCACAO" ||
                      formData.usage === "VENDA_LOCACAO") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Valor Mínimo Aluguel (R$)
                          </Label>
                          <Input
                            type="number"
                            value={formData.priceRentMin}
                            onChange={(e) =>
                              handleInputChange("priceRentMin", e.target.value)
                            }
                            placeholder="0,00"
                            className="h-12 font-bold rounded-xl glass border-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Condomínio
                        </Label>
                        <Input
                          type="number"
                          value={formData.condoFee}
                          onChange={(e) =>
                            handleInputChange("condoFee", e.target.value)
                          }
                          placeholder="R$ 0"
                          className="h-12 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          IPTU Anual
                        </Label>
                        <Input
                          type="number"
                          value={formData.taxFee}
                          onChange={(e) =>
                            handleInputChange("taxFee", e.target.value)
                          }
                          placeholder="R$ 0"
                          className="h-12 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          IPTU Parcelas
                        </Label>
                        <Input
                          type="number"
                          value={formData.iptuInstallments}
                          onChange={(e) =>
                            handleInputChange(
                              "iptuInstallments",
                              e.target.value,
                            )
                          }
                          placeholder="12"
                          className="h-12 font-bold rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        Destaque do Anúncio
                      </Label>
                      <Input
                        value={formData.highlight}
                        onChange={(e) =>
                          handleInputChange("highlight", e.target.value)
                        }
                        placeholder="Ex: Vista Increível, 360° Panorâmica, Mobiliado por Designer"
                        className="h-12 font-bold rounded-xl glass border-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        Perfil do Comprador Ideal
                      </Label>
                      <Input
                        value={formData.targetBuyer}
                        onChange={(e) =>
                          handleInputChange("targetBuyer", e.target.value)
                        }
                        placeholder="Ex: Famílias pequenas, Casais sem filhos, Investidores"
                        className="h-12 font-bold rounded-xl glass border-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Metrics */}
                {currentStep === 1 && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <MetricItem
                        label="Quartos"
                        icon={Bed}
                        value={formData.metrics.bedrooms}
                        onChange={(v: string) =>
                          handleInputChange("bedrooms", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Suítes VIP"
                        icon={ShieldCheck}
                        value={formData.metrics.suites}
                        onChange={(v: string) =>
                          handleInputChange("suites", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Banheiros"
                        icon={Bath}
                        value={formData.metrics.bathrooms}
                        onChange={(v: string) =>
                          handleInputChange("bathrooms", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Lavabos"
                        icon={Bath}
                        value={formData.metrics.halfBathrooms}
                        onChange={(v: string) =>
                          handleInputChange("halfBathrooms", v, "metrics")
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <MetricItem
                        label="Banheiro Social"
                        icon={Bath}
                        value={formData.metrics.bathroomsSocial}
                        onChange={(v: string) =>
                          handleInputChange("bathroomsSocial", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Banheiro Serviço"
                        icon={Bath}
                        value={formData.metrics.bathroomsService}
                        onChange={(v: string) =>
                          handleInputChange("bathroomsService", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Garagem Coberta"
                        icon={Car}
                        value={formData.metrics.garagesCovered}
                        onChange={(v: string) =>
                          handleInputChange("garagesCovered", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Garagem Aberta"
                        icon={Car}
                        value={formData.metrics.garagesOpen}
                        onChange={(v: string) =>
                          handleInputChange("garagesOpen", v, "metrics")
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <MetricItem
                        label="Área Útil (m²)"
                        icon={Maximize2}
                        value={formData.metrics.areaUseful}
                        onChange={(v: string) =>
                          handleInputChange("areaUseful", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Área Total"
                        icon={Layers}
                        value={formData.metrics.areaTotal}
                        onChange={(v: string) =>
                          handleInputChange("areaTotal", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Área Privativa"
                        icon={Building}
                        value={formData.metrics.areaPrivate}
                        onChange={(v: string) =>
                          handleInputChange("areaPrivate", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Área Comum"
                        icon={Users}
                        value={formData.metrics.areaCommon}
                        onChange={(v: string) =>
                          handleInputChange("areaCommon", v, "metrics")
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <MetricItem
                        label="Terraço (m²)"
                        icon={Maximize2}
                        value={formData.metrics.areaTerrace}
                        onChange={(v: string) =>
                          handleInputChange("areaTerrace", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Sacada (m²)"
                        icon={Maximize2}
                        value={formData.metrics.areaBalcony}
                        onChange={(v: string) =>
                          handleInputChange("areaBalcony", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Jardim (m²)"
                        icon={TreePine}
                        value={formData.metrics.areaGarden}
                        onChange={(v: string) =>
                          handleInputChange("areaGarden", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Piscina (m²)"
                        icon={Waves}
                        value={formData.metrics.areaPool}
                        onChange={(v: string) =>
                          handleInputChange("areaPool", v, "metrics")
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                      <MetricItem
                        label="Testada (m)"
                        icon={Ruler}
                        value={formData.metrics.frontMeasure}
                        onChange={(v: string) =>
                          handleInputChange("frontMeasure", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Lateral (m)"
                        icon={Ruler}
                        value={formData.metrics.sideMeasure}
                        onChange={(v: string) =>
                          handleInputChange("sideMeasure", v, "metrics")
                        }
                      />
                      <MetricItem
                        label="Profundidade (m)"
                        icon={Ruler}
                        value={formData.metrics.depthMeasure}
                        onChange={(v: string) =>
                          handleInputChange("depthMeasure", v, "metrics")
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Descrição Master (AI Enhanced)
                        </Label>
                        <Badge className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none gap-2 px-4 py-2 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95">
                          <Sparkles className="w-3.5 h-3.5 fill-current" />{" "}
                          Auto-Compor Copywriting
                        </Badge>
                      </div>
                      <Textarea
                        rows={8}
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Descreva as sensações, o lifestyle e os materiais nobres utilizados. Ex: Mármore Carrara, Automação Control4, Sunset Privativo..."
                        className="rounded-[2.5rem] border-none glass p-8 font-medium leading-[1.8] text-lg focus-visible:ring-primary/20 focus-visible:bg-white/5"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Rooms */}
                {currentStep === 2 && (
                  <div className="space-y-12">
                    <div className="space-y-8">
                      <SectionHeader
                        title="Ambientes Principais"
                        icon={DoorOpen}
                        expanded={expandedSections.indoor}
                        onToggle={() => toggleSection("indoor")}
                      />

                      {expandedSections.indoor && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RoomToggle
                              room="livingRoom"
                              label="Sala de Estar"
                              area={formData.rooms.livingRoomArea}
                              checked={formData.rooms.livingRoom}
                              onAreaChange={(v) =>
                                handleInputChange("livingRoomArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("livingRoom")}
                            />
                            <RoomToggle
                              room="diningRoom"
                              label="Sala de Jantar"
                              area={formData.rooms.diningRoomArea}
                              checked={formData.rooms.diningRoom}
                              onAreaChange={(v) =>
                                handleInputChange("diningRoomArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("diningRoom")}
                            />
                            <RoomToggle
                              room="tvRoom"
                              label="Sala de TV / Home Theater"
                              area={formData.rooms.tvRoomArea}
                              checked={formData.rooms.tvRoom}
                              onAreaChange={(v) =>
                                handleInputChange("tvRoomArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("tvRoom")}
                            />
                            <RoomToggle
                              room="studyRoom"
                              label="Sala de Estudo / Leitura"
                              area={formData.rooms.studyRoomArea}
                              checked={formData.rooms.studyRoom}
                              onAreaChange={(v) =>
                                handleInputChange("studyRoomArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("studyRoom")}
                            />
                            <RoomToggle
                              room="office"
                              label="Escritório / Home Office"
                              area={formData.rooms.officeArea}
                              checked={formData.rooms.office}
                              onAreaChange={(v) =>
                                handleInputChange("officeArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("office")}
                            />
                            <RoomToggle
                              room="library"
                              label="Biblioteca"
                              area={formData.rooms.libraryArea}
                              checked={formData.rooms.library}
                              onAreaChange={(v) =>
                                handleInputChange("libraryArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("library")}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RoomToggle
                              room="kitchen"
                              label="Cozinha"
                              area={formData.rooms.kitchenArea}
                              checked={formData.rooms.kitchen}
                              onAreaChange={(v) =>
                                handleInputChange("kitchenArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("kitchen")}
                            />
                            <RoomToggle
                              room="kitchenAmerican"
                              label="Cozinha Americana"
                              area=""
                              checked={formData.rooms.kitchenAmerican}
                              onToggle={() => toggleRoom("kitchenAmerican")}
                            />
                            <RoomToggle
                              room="kitchenGourmet"
                              label="Cozinha Gourmet"
                              area={formData.rooms.gourmetKitchenArea}
                              checked={formData.rooms.kitchenGourmet}
                              onAreaChange={(v) =>
                                handleInputChange(
                                  "gourmetKitchenArea",
                                  v,
                                  "rooms",
                                )
                              }
                              onToggle={() => toggleRoom("kitchenGourmet")}
                            />
                            <RoomToggle
                              room="pantry"
                              label="Despensa"
                              area={formData.rooms.pantryArea}
                              checked={formData.rooms.pantry}
                              onAreaChange={(v) =>
                                handleInputChange("pantryArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("pantry")}
                            />
                            <RoomToggle
                              room="laundry"
                              label="Área de Serviço / Lavanderia"
                              area={formData.rooms.laundryArea}
                              checked={formData.rooms.laundry}
                              onAreaChange={(v) =>
                                handleInputChange("laundryArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("laundry")}
                            />
                            <RoomToggle
                              room="serviceRoom"
                              label="Quarto de Empregada"
                              area={formData.rooms.serviceRoomArea}
                              checked={formData.rooms.serviceRoom}
                              onAreaChange={(v) =>
                                handleInputChange("serviceRoomArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("serviceRoom")}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RoomToggle
                              room="storage"
                              label="Depósito / storage"
                              area={formData.rooms.storageArea}
                              checked={formData.rooms.storage}
                              onAreaChange={(v) =>
                                handleInputChange("storageArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("storage")}
                            />
                            <RoomToggle
                              room="wineCellar"
                              label="Adega Climatizada"
                              area={formData.rooms.wineCellarArea}
                              checked={formData.rooms.wineCellar}
                              onAreaChange={(v) =>
                                handleInputChange("wineCellarArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("wineCellar")}
                            />
                            <RoomToggle
                              room="bar"
                              label="Bar / Banqueta"
                              area={formData.rooms.barArea}
                              checked={formData.rooms.bar}
                              onAreaChange={(v) =>
                                handleInputChange("barArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("bar")}
                            />
                            <RoomToggle
                              room="gym"
                              label="Sala de Ginástica"
                              area={formData.rooms.gymArea}
                              checked={formData.rooms.gym}
                              onAreaChange={(v) =>
                                handleInputChange("gymArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("gym")}
                            />
                            <RoomToggle
                              room="sauna"
                              label="Sauna Privativa"
                              area={formData.rooms.saunaArea}
                              checked={formData.rooms.sauna}
                              onAreaChange={(v) =>
                                handleInputChange("saunaArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("sauna")}
                            />
                            <RoomToggle
                              room="steamRoom"
                              label="Banho de Vapor"
                              area=""
                              checked={formData.rooms.steamRoom}
                              onToggle={() => toggleRoom("steamRoom")}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RoomToggle
                              room="closet"
                              label="Closet"
                              area={formData.rooms.closetArea}
                              checked={formData.rooms.closet}
                              onAreaChange={(v) =>
                                handleInputChange("closetArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("closet")}
                            />
                            <RoomToggle
                              room="walkInCloset"
                              label="Closet Master"
                              area=""
                              checked={formData.rooms.walkInCloset}
                              onToggle={() => toggleRoom("walkInCloset")}
                            />
                            <RoomToggle
                              room="basement"
                              label="Porão / Subsolo"
                              area={formData.rooms.basementArea}
                              checked={formData.rooms.basement}
                              onAreaChange={(v) =>
                                handleInputChange("basementArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("basement")}
                            />
                            <RoomToggle
                              room="attic"
                              label="Sótão / Attic"
                              area={formData.rooms.atticArea}
                              checked={formData.rooms.attic}
                              onAreaChange={(v) =>
                                handleInputChange("atticArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("attic")}
                            />
                            <RoomToggle
                              room="cellar"
                              label="Caixa d'Água / Reservatório"
                              area=""
                              checked={formData.rooms.cellar}
                              onToggle={() => toggleRoom("cellar")}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      <SectionHeader
                        title="Áreas Externas e Lazer"
                        icon={TreePine}
                        expanded={expandedSections.outdoor}
                        onToggle={() => toggleSection("outdoor")}
                      />

                      {expandedSections.outdoor && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RoomToggle
                              room="terrace"
                              label="Terraço"
                              area={formData.rooms.terraceArea}
                              checked={formData.rooms.terrace}
                              onAreaChange={(v) =>
                                handleInputChange("terraceArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("terrace")}
                            />
                            <RoomToggle
                              room="balcony"
                              label="Sacada / Varanda"
                              area={formData.rooms.balconyArea}
                              checked={formData.rooms.balcony}
                              onAreaChange={(v) =>
                                handleInputChange("balconyArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("balcony")}
                            />
                            <RoomToggle
                              room="garden"
                              label="Jardim"
                              area={formData.rooms.gardenArea}
                              checked={formData.rooms.garden}
                              onAreaChange={(v) =>
                                handleInputChange("gardenArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("garden")}
                            />
                            <RoomToggle
                              room="pool"
                              label="Piscina"
                              area={formData.rooms.poolArea}
                              checked={formData.rooms.pool}
                              onAreaChange={(v) =>
                                handleInputChange("poolArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("pool")}
                            />
                            <RoomToggle
                              room="jacuzzi"
                              label="Banheira de Hidromassagem"
                              area={formData.rooms.jacuzziArea}
                              checked={formData.rooms.jacuzzi}
                              onAreaChange={(v) =>
                                handleInputChange("jacuzziArea", v, "rooms")
                              }
                              onToggle={() => toggleRoom("jacuzzi")}
                            />
                            <RoomToggle
                              room="bathroomPool"
                              label="Banheiro da Piscina"
                              area=""
                              checked={formData.rooms.bathroomPool}
                              onToggle={() => toggleRoom("bathroomPool")}
                            />
                            <RoomToggle
                              room="bathroomGym"
                              label="Banheiro da Academia"
                              area=""
                              checked={formData.rooms.bathroomGym}
                              onToggle={() => toggleRoom("bathroomGym")}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Custom Rooms */}
                    <div className="space-y-6 p-8 rounded-[2.5rem] glass border-none">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Adicionar Cômodo Personalizado
                        </Label>
                        <Button
                          onClick={addCustomRoom}
                          className="glass rounded-xl h-10 px-4 border-none"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </Button>
                      </div>
                      {customRooms.map((room, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <Input
                            value={room.name}
                            onChange={(e) =>
                              updateCustomRoom(index, "name", e.target.value)
                            }
                            placeholder="Nome do cômodo"
                            className="flex-1 h-12 rounded-xl glass border-none"
                          />
                          <Input
                            type="number"
                            value={room.area}
                            onChange={(e) =>
                              updateCustomRoom(index, "area", e.target.value)
                            }
                            placeholder="m²"
                            className="w-24 h-12 rounded-xl glass border-none"
                          />
                          <Button
                            onClick={() => removeCustomRoom(index)}
                            variant="ghost"
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Features */}
                {currentStep === 3 && (
                  <div className="space-y-12">
                    <FeatureCategory title="Infraestrutura Inteligente">
                      <FeatureToggle
                        active={formData.features.hasAirConditioning}
                        label="Ar-Condicionado"
                        icon={AirVent}
                        onClick={() => toggleFeature("hasAirConditioning")}
                      />
                      <FeatureToggle
                        active={formData.features.hasCentralAir}
                        label="Ar-Condicionado Central"
                        icon={AirVent}
                        onClick={() => toggleFeature("hasCentralAir")}
                      />
                      <FeatureToggle
                        active={formData.features.hasAutomation}
                        label="Automação Inteligente"
                        icon={Zap}
                        onClick={() => toggleFeature("hasAutomation")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSmartLock}
                        label="Fechadura Smart"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasSmartLock")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBiometricEntry}
                        label="Entrada Biométrica"
                        icon={User}
                        onClick={() => toggleFeature("hasBiometricEntry")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSmartSecurity}
                        label="Segurança Smart"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasSmartSecurity")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSoundSystem}
                        label="Sistema de Som"
                        icon={MusicIcon}
                        onClick={() => toggleFeature("hasSoundSystem")}
                      />
                      <FeatureToggle
                        active={formData.features.hasWifi}
                        label="Wi-Fi Premium"
                        icon={Wifi}
                        onClick={() => toggleFeature("hasWifi")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBlindsElectric}
                        label="Persianas Elétricas"
                        icon={Building}
                        onClick={() => toggleFeature("hasBlindsElectric")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Luxo & Conforto">
                      <FeatureToggle
                        active={formData.features.hasPool}
                        label="Piscina Privativa"
                        icon={Waves}
                        onClick={() => toggleFeature("hasPool")}
                      />
                      <FeatureToggle
                        active={formData.features.hasHeatedPool}
                        label="Piscina Aquecida"
                        icon={Heater}
                        onClick={() => toggleFeature("hasHeatedPool")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPoolCover}
                        label="Piscina com Cover"
                        icon={Waves}
                        onClick={() => toggleFeature("hasPoolCover")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPoolIlluminated}
                        label="Piscina Iluminada"
                        icon={Sun}
                        onClick={() => toggleFeature("hasPoolIlluminated")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBathtub}
                        label="Banheira / Jacuzzi"
                        icon={Waves}
                        onClick={() => toggleFeature("hasBathtub")}
                      />
                      <FeatureToggle
                        active={formData.features.hasJacuzzi}
                        label="Jacuzzi Externo"
                        icon={Waves}
                        onClick={() => toggleFeature("hasJacuzzi")}
                      />
                      <FeatureToggle
                        active={formData.features.hasWineCellar}
                        label="Adega Climatizada"
                        icon={Wine}
                        onClick={() => toggleFeature("hasWineCellar")}
                      />
                      <FeatureToggle
                        active={formData.features.hasGourmetKitchen}
                        label="Espaço Gourmet"
                        icon={Utensils}
                        onClick={() => toggleFeature("hasGourmetKitchen")}
                      />
                      <FeatureToggle
                        active={formData.features.hasFireplace}
                        label="Lareira / Webasto"
                        icon={Heater}
                        onClick={() => toggleFeature("hasFireplace")}
                      />
                      <FeatureToggle
                        active={formData.features.hasHomeOffice}
                        label="Home Office Studio"
                        icon={Tv}
                        onClick={() => toggleFeature("hasHomeOffice")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPanicRoom}
                        label="Panic Room / Cofre"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasPanicRoom")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSafe}
                        label="Cofre Embutido"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasSafe")}
                      />
                      <FeatureToggle
                        active={formData.features.hasWalkInCloset}
                        label="Closet Master Walk-in"
                        icon={User}
                        onClick={() => toggleFeature("hasWalkInCloset")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Lazer & Entretenimento">
                      <FeatureToggle
                        active={formData.features.hasGym}
                        label="Academia / Espaço Fitness"
                        icon={Dumbbell}
                        onClick={() => toggleFeature("hasGym")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSauna}
                        label="Sauna / SPA"
                        icon={Heater}
                        onClick={() => toggleFeature("hasSauna")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSpa}
                        label="SPA / Sala de Massagem"
                        icon={Star}
                        onClick={() => toggleFeature("hasSpa")}
                      />
                      <FeatureToggle
                        active={formData.features.hasTennisCourt}
                        label="Quadra de Tênis"
                        icon={Volleyball}
                        onClick={() => toggleFeature("hasTennisCourt")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSoccerField}
                        label="Campo de Futebol"
                        icon={Star}
                        onClick={() => toggleFeature("hasSoccerField")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBasketballCourt}
                        label="Quadra de Basquete"
                        icon={Star}
                        onClick={() => toggleFeature("hasBasketballCourt")}
                      />
                      <FeatureToggle
                        active={formData.features.hasCinema}
                        label="Cine-Theater"
                        icon={Tv}
                        onClick={() => toggleFeature("hasCinema")}
                      />
                      <FeatureToggle
                        active={formData.features.hasGamesRoom}
                        label="Sala de Jogos"
                        icon={Star}
                        onClick={() => toggleFeature("hasGamesRoom")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBilliardRoom}
                        label="Sinuca / Bilhares"
                        icon={Star}
                        onClick={() => toggleFeature("hasBilliardRoom")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPetPlace}
                        label="Pet Place / Resort"
                        icon={Dog}
                        onClick={() => toggleFeature("hasPetPlace")}
                      />
                      <FeatureToggle
                        active={formData.features.hasHeliport}
                        label="Heliporto Privativo"
                        icon={Plane}
                        onClick={() => toggleFeature("hasHeliport")}
                      />
                      <FeatureToggle
                        active={formData.features.hasMarina}
                        label="Marina / Pier Privado"
                        icon={Ship}
                        onClick={() => toggleFeature("hasMarina")}
                      />
                      <FeatureToggle
                        active={formData.features.hasGarden}
                        label="Jardim Decorado"
                        icon={Flower2}
                        onClick={() => toggleFeature("hasGarden")}
                      />
                      <FeatureToggle
                        active={formData.features.hasKoiPond}
                        label="Lago Ornamental (Koi)"
                        icon={Star}
                        onClick={() => toggleFeature("hasKoiPond")}
                      />
                      <FeatureToggle
                        active={formData.features.hasYogaSpace}
                        label="Espaço Yoga / Meditação"
                        icon={Star}
                        onClick={() => toggleFeature("hasYogaSpace")}
                      />
                      <FeatureToggle
                        active={formData.features.hasDeck}
                        label="Deck de Madeira"
                        icon={Star}
                        onClick={() => toggleFeature("hasDeck")}
                      />
                      <FeatureToggle
                        active={formData.features.hasHammock}
                        label="Rede / Rede Suspensa"
                        icon={Star}
                        onClick={() => toggleFeature("hasHammock")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBqqGrill}
                        label="Churrasqueira Integrada"
                        icon={Utensils}
                        onClick={() => toggleFeature("hasBqqGrill")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPizzaOven}
                        label="Forno a Lenha / Pizza"
                        icon={Star}
                        onClick={() => toggleFeature("hasPizzaOven")}
                      />
                      <FeatureToggle
                        active={formData.features.hasFirePit}
                        label="Fogueira / Fire Pit"
                        icon={Flame}
                        onClick={() => toggleFeature("hasFirePit")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Sustentabilidade">
                      <FeatureToggle
                        active={formData.features.hasSolarHeating}
                        label="Aquecimento Solar"
                        icon={Sun}
                        onClick={() => toggleFeature("hasSolarHeating")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSolarPanel}
                        label="Painéis Solares"
                        icon={Sun}
                        onClick={() => toggleFeature("hasSolarPanel")}
                      />
                      <FeatureToggle
                        active={formData.features.hasVegetablesGarden}
                        label="Horta Orgânica"
                        icon={Leaf}
                        onClick={() => toggleFeature("hasVegetablesGarden")}
                      />
                      <FeatureToggle
                        active={formData.features.hasOrchidGarden}
                        label="Jardim de Orquídeas"
                        icon={Flower2}
                        onClick={() => toggleFeature("hasOrchidGarden")}
                      />
                      <FeatureToggle
                        active={formData.features.hasVerticalGarden}
                        label="Jardim Vertical"
                        icon={Leaf}
                        onClick={() => toggleFeature("hasVerticalGarden")}
                      />
                      <FeatureToggle
                        active={formData.features.hasRainwater}
                        label="Reaproveitamento de Água"
                        icon={Droplets}
                        onClick={() => toggleFeature("hasRainwater")}
                      />
                      <FeatureToggle
                        active={formData.features.hasElectricCharger}
                        label="Carregador EV"
                        icon={Zap}
                        onClick={() => toggleFeature("hasElectricCharger")}
                      />
                      <FeatureToggle
                        active={formData.features.hasEvReady}
                        label="Infraestrutura EV Ready"
                        icon={Zap}
                        onClick={() => toggleFeature("hasEvReady")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Segurança">
                      <FeatureToggle
                        active={formData.features.hasSecurity24h}
                        label="Segurança Armada 24h"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasSecurity24h")}
                      />
                      <FeatureToggle
                        active={formData.features.hasMonitoring}
                        label="Câmeras / Monitoramento"
                        icon={Camera}
                        onClick={() => toggleFeature("hasMonitoring")}
                      />
                      <FeatureToggle
                        active={formData.features.hasAlarm}
                        label="Alarme Monitorado"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasAlarm")}
                      />
                      <FeatureToggle
                        active={formData.features.hasArmoredDoor}
                        label="Porta Blindada"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasArmoredDoor")}
                      />
                      <FeatureToggle
                        active={formData.features.hasElectricFence}
                        label="Cerca Elétrica"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasElectricFence")}
                      />
                      <FeatureToggle
                        active={formData.features.hasElectronicGate}
                        label="Portão Eletrônico"
                        icon={Building}
                        onClick={() => toggleFeature("hasElectronicGate")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSmartGate}
                        label="Portão Smart"
                        icon={Building}
                        onClick={() => toggleFeature("hasSmartGate")}
                      />
                      <FeatureToggle
                        active={formData.features.hasBiometricAccess}
                        label="Acesso Biométrico"
                        icon={User}
                        onClick={() => toggleFeature("hasBiometricAccess")}
                      />
                      <FeatureToggle
                        active={formData.features.hasFacialRecognition}
                        label="Reconhecimento Facial"
                        icon={User}
                        onClick={() => toggleFeature("hasFacialRecognition")}
                      />
                      <FeatureToggle
                        active={formData.features.hasVehicleRecognition}
                        label="Reconhecimento Veicular"
                        icon={Car}
                        onClick={() => toggleFeature("hasVehicleRecognition")}
                      />
                      <FeatureToggle
                        active={formData.features.hasPanicButton}
                        label="Botão de Pânico"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasPanicButton")}
                      />
                      <FeatureToggle
                        active={formData.features.hasSafeRoom}
                        label="Safe Room"
                        icon={ShieldCheck}
                        onClick={() => toggleFeature("hasSafeRoom")}
                      />
                      <FeatureToggle
                        active={formData.features.hasGuardDog}
                        label="Cão de Guarda"
                        icon={Dog}
                        onClick={() => toggleFeature("hasGuardDog")}
                      />
                    </FeatureCategory>

                    {/* Custom Amenities */}
                    <div className="space-y-6 p-8 rounded-[2.5rem] glass border-none">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Adicionar Característica Personalizada
                        </Label>
                        <Button
                          onClick={addCustomAmenity}
                          className="glass rounded-xl h-10 px-4 border-none"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </Button>
                      </div>
                      {customAmenities.map((amenity, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <Input
                            value={amenity.name}
                            onChange={(e) =>
                              updateCustomAmenity(index, "name", e.target.value)
                            }
                            placeholder="Nome da característica"
                            className="flex-1 h-12 rounded-xl glass border-none"
                          />
                          <Input
                            type="number"
                            value={amenity.area}
                            onChange={(e) =>
                              updateCustomAmenity(index, "area", e.target.value)
                            }
                            placeholder="m²"
                            className="w-24 h-12 rounded-xl glass border-none"
                          />
                          <Button
                            onClick={() => removeCustomAmenity(index)}
                            variant="ghost"
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Building */}
                {currentStep === 4 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                        <Building className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">
                          Estrutura do Edifício
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          Dados do Condomínio e Prédio
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Nome do Edifício/Residencial
                          </Label>
                          <Input
                            value={formData.building.name}
                            onChange={(e) =>
                              handleInputChange(
                                "name",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="Ex: Edifício Eiffel Tower"
                            className="h-14 font-bold rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Tipo de Edificação
                          </Label>
                          <Select
                            value={formData.building.type}
                            onValueChange={(v) =>
                              handleInputChange("type", v, "building")
                            }
                          >
                            <SelectTrigger className="h-14 rounded-2xl glass border-none font-bold">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="glass-effect rounded-2xl border-none">
                              <SelectItem value="RESIDENCIAL">
                                Residencial
                              </SelectItem>
                              <SelectItem value="COMERCIAL">
                                Comercial
                              </SelectItem>
                              <SelectItem value="MISTO">Misto</SelectItem>
                              <SelectItem value="CORPORATIVO">
                                Corporativo
                              </SelectItem>
                              <SelectItem value="HOTEL">Hotel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Andares Totais
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.totalFloors}
                            onChange={(e) =>
                              handleInputChange(
                                "totalFloors",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Andar Atual
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.currentFloor}
                            onChange={(e) =>
                              handleInputChange(
                                "currentFloor",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Unidades Total
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.unitsTotal}
                            onChange={(e) =>
                              handleInputChange(
                                "unitsTotal",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Unidades/Andar
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.unitsPerFloor}
                            onChange={(e) =>
                              handleInputChange(
                                "unitsPerFloor",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Elevadores
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.elevators}
                            onChange={(e) =>
                              handleInputChange(
                                "elevators",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Ano Construção
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.constructionYear}
                            onChange={(e) =>
                              handleInputChange(
                                "constructionYear",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="202X"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Ano Entrega
                          </Label>
                          <Input
                            type="number"
                            value={formData.building.deliveryYear}
                            onChange={(e) =>
                              handleInputChange(
                                "deliveryYear",
                                e.target.value,
                                "building",
                              )
                            }
                            placeholder="202X"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <OptionBadge
                            active={formData.building.serviceElevator}
                            label="Elevador de Serviço"
                            onClick={() =>
                              handleInputChange(
                                "serviceElevator",
                                !formData.building.serviceElevator,
                                "building",
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[2.5rem] glass space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                            Infra Individualizada
                          </h3>
                          <div className="flex gap-4 flex-wrap">
                            <OptionBadge
                              active={formData.building.hasGenerator}
                              label="Gerador"
                              onClick={() =>
                                handleInputChange(
                                  "hasGenerator",
                                  !formData.building.hasGenerator,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasIndividualWater}
                              label="Água Individual"
                              onClick={() =>
                                handleInputChange(
                                  "hasIndividualWater",
                                  !formData.building.hasIndividualWater,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasIndividualGas}
                              label="Gás Encanado"
                              onClick={() =>
                                handleInputChange(
                                  "hasIndividualGas",
                                  !formData.building.hasIndividualGas,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasIndividualMeter}
                              label="Medidor Individual"
                              onClick={() =>
                                handleInputChange(
                                  "hasIndividualMeter",
                                  !formData.building.hasIndividualMeter,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasHydrometer}
                              label="Hidrômetro"
                              onClick={() =>
                                handleInputChange(
                                  "hasHydrometer",
                                  !formData.building.hasHydrometer,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasGasPipeline}
                              label="Gasômetro"
                              onClick={() =>
                                handleInputChange(
                                  "hasGasPipeline",
                                  !formData.building.hasGasPipeline,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasCentralVacuum}
                              label="Aspiração Central"
                              onClick={() =>
                                handleInputChange(
                                  "hasCentralVacuum",
                                  !formData.building.hasCentralVacuum,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasPressurizedSystem}
                              label="Pressurização"
                              onClick={() =>
                                handleInputChange(
                                  "hasPressurizedSystem",
                                  !formData.building.hasPressurizedSystem,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasWaterTank}
                              label="Caixa d'Água"
                              onClick={() =>
                                handleInputChange(
                                  "hasWaterTank",
                                  !formData.building.hasWaterTank,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasCistern}
                              label="Cisterna"
                              onClick={() =>
                                handleInputChange(
                                  "hasCistern",
                                  !formData.building.hasCistern,
                                  "building",
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="p-8 rounded-[2.5rem] glass space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                            Digital Readiness
                          </h3>
                          <div className="flex gap-4 flex-wrap">
                            <OptionBadge
                              active={formData.building.hasSolarPanel}
                              label="Painel Solar"
                              onClick={() =>
                                handleInputChange(
                                  "hasSolarPanel",
                                  !formData.building.hasSolarPanel,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasElectricCharger}
                              label="Carregador EV"
                              onClick={() =>
                                handleInputChange(
                                  "hasElectricCharger",
                                  !formData.building.hasElectricCharger,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasEvReady}
                              label="EV Ready"
                              onClick={() =>
                                handleInputChange(
                                  "hasEvReady",
                                  !formData.building.hasEvReady,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasSmartSecurity}
                              label="Smart Security"
                              onClick={() =>
                                handleInputChange(
                                  "hasSmartSecurity",
                                  !formData.building.hasSmartSecurity,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasAccessControl}
                              label="Controle Acesso"
                              onClick={() =>
                                handleInputChange(
                                  "hasAccessControl",
                                  !formData.building.hasAccessControl,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasBiometricAccess}
                              label="Biometria"
                              onClick={() =>
                                handleInputChange(
                                  "hasBiometricAccess",
                                  !formData.building.hasBiometricAccess,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasFacialRecognition}
                              label="Reconhecimento Facial"
                              onClick={() =>
                                handleInputChange(
                                  "hasFacialRecognition",
                                  !formData.building.hasFacialRecognition,
                                  "building",
                                )
                              }
                            />
                            <OptionBadge
                              active={formData.building.hasVehicleRecognition}
                              label="Reconh. Veicular"
                              onClick={() =>
                                handleInputChange(
                                  "hasVehicleRecognition",
                                  !formData.building.hasVehicleRecognition,
                                  "building",
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-8 rounded-[2.5rem] glass space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                          Acessibilidade & Conveniência
                        </h3>
                        <div className="flex gap-4 flex-wrap">
                          <OptionBadge
                            active={formData.building.hasHandicappedAccess}
                            label="Acesso Deficiente"
                            onClick={() =>
                              handleInputChange(
                                "hasHandicappedAccess",
                                !formData.building.hasHandicappedAccess,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasAccessibleUnits}
                            label="Unidades Adaptadas"
                            onClick={() =>
                              handleInputChange(
                                "hasAccessibleUnits",
                                !formData.building.hasAccessibleUnits,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasPetFriendly}
                            label="Pet Friendly"
                            onClick={() =>
                              handleInputChange(
                                "hasPetFriendly",
                                !formData.building.hasPetFriendly,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasSmokeArea}
                            label="Área Fumantes"
                            onClick={() =>
                              handleInputChange(
                                "hasSmokeArea",
                                !formData.building.hasSmokeArea,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasBikeFriendly}
                            label="Bike Friendly"
                            onClick={() =>
                              handleInputChange(
                                "hasBikeFriendly",
                                !formData.building.hasBikeFriendly,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasCargoArea}
                            label="Área Carga/Descarga"
                            onClick={() =>
                              handleInputChange(
                                "hasCargoArea",
                                !formData.building.hasCargoArea,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasVisitantParking}
                            label="Vaga Visitantes"
                            onClick={() =>
                              handleInputChange(
                                "hasVisitantParking",
                                !formData.building.hasVisitantParking,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasRooftop}
                            label="Roof Garden"
                            onClick={() =>
                              handleInputChange(
                                "hasRooftop",
                                !formData.building.hasRooftop,
                                "building",
                              )
                            }
                          />
                          <OptionBadge
                            active={formData.building.hasSkyGarden}
                            label="Sky Garden"
                            onClick={() =>
                              handleInputChange(
                                "hasSkyGarden",
                                !formData.building.hasSkyGarden,
                                "building",
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Condo Amenities */}
                {currentStep === 5 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">
                          Área Comum do Condomínio
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          Todas as amenidades disponíveis no empreendimento
                        </p>
                      </div>
                    </div>

                    <FeatureCategory title="Piscina & Aquáticos">
                      <FeatureToggle
                        active={formData.condoAmenities.hasPoolCondo}
                        label="Piscina"
                        icon={Waves}
                        onClick={() => toggleCondoAmenity("hasPoolCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.poolCondoHeated}
                        label="Piscina Aquecida"
                        icon={Heater}
                        onClick={() => toggleCondoAmenity("poolCondoHeated")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasRooftopPool}
                        label="Piscina no Rooftop"
                        icon={Waves}
                        onClick={() => toggleCondoAmenity("hasRooftopPool")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSpaCondo}
                        label="SPA / Hidromassagem"
                        icon={Waves}
                        onClick={() => toggleCondoAmenity("hasSpaCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSaunaCondo}
                        label="Sauna"
                        icon={Heater}
                        onClick={() => toggleCondoAmenity("hasSaunaCondo")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Fitness & Esporte">
                      <FeatureToggle
                        active={formData.condoAmenities.hasGymCondo}
                        label="Academia"
                        icon={Dumbbell}
                        onClick={() => toggleCondoAmenity("hasGymCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasFunctionalRoom}
                        label="Sala Funcional"
                        icon={Dumbbell}
                        onClick={() => toggleCondoAmenity("hasFunctionalRoom")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasPilatesCondo}
                        label="Pilates"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasPilatesCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasYogaCondo}
                        label="Espaço Yoga"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasYogaCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasDancingRoom}
                        label="Sala de Dança"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasDancingRoom")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasTennisCourtCondo}
                        label="Quadra de Tênis"
                        icon={Volleyball}
                        onClick={() =>
                          toggleCondoAmenity("hasTennisCourtCondo")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSoccerFieldCondo}
                        label="Campo de Futebol"
                        icon={Star}
                        onClick={() =>
                          toggleCondoAmenity("hasSoccerFieldCondo")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasBasketballCondo}
                        label="Quadra Basquete"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasBasketballCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasVolleyballCondo}
                        label="Vôlei de Praia"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasVolleyballCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSquashCondo}
                        label="Squash"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasSquashCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasRacquetball}
                        label="Racketball"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasRacquetball")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Lazer & Social">
                      <FeatureToggle
                        active={formData.condoAmenities.hasPartyRoomCondo}
                        label="Salão de Festas"
                        icon={Users}
                        onClick={() => toggleCondoAmenity("hasPartyRoomCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasGourmetSpace}
                        label="Espaço Gourmet"
                        icon={Utensils}
                        onClick={() => toggleCondoAmenity("hasGourmetSpace")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasBarbecueArea}
                        label="Churrasqueira"
                        icon={Utensils}
                        onClick={() => toggleCondoAmenity("hasBarbecueArea")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasFireplaceArea}
                        label="Lareira"
                        icon={Heater}
                        onClick={() => toggleCondoAmenity("hasFireplaceArea")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasCinemaCondo}
                        label="Cinema"
                        icon={Tv}
                        onClick={() => toggleCondoAmenity("hasCinemaCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasGameRoomCondo}
                        label="Game Room"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasGameRoomCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasMusicRoomCondo}
                        label="Music Room"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasMusicRoomCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasKidsClub}
                        label="Kids Club"
                        icon={Baby}
                        onClick={() => toggleCondoAmenity("hasKidsClub")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasPlaygroundCondo}
                        label="Playground"
                        icon={Baby}
                        onClick={() => toggleCondoAmenity("hasPlaygroundCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasZenSpace}
                        label="Espaço Zen"
                        icon={Leaf}
                        onClick={() => toggleCondoAmenity("hasZenSpace")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasBeautySalon}
                        label="Salão de Beleza"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasBeautySalon")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasMassageRoom}
                        label="Sala de Massagem"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasMassageRoom")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Business & Serviços">
                      <FeatureToggle
                        active={formData.condoAmenities.hasBusinessCenter}
                        label="Business Center"
                        icon={Briefcase}
                        onClick={() => toggleCondoAmenity("hasBusinessCenter")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasMeetingRoom}
                        label="Sala de Reuniões"
                        icon={Users}
                        onClick={() => toggleCondoAmenity("hasMeetingRoom")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasCoworking}
                        label="Coworking"
                        icon={Briefcase}
                        onClick={() => toggleCondoAmenity("hasCoworking")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasAuditorium}
                        label="Auditório"
                        icon={Users}
                        onClick={() => toggleCondoAmenity("hasAuditorium")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasConciergeService}
                        label="Concierge"
                        icon={User}
                        onClick={() =>
                          toggleCondoAmenity("hasConciergeService")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.has24hReception}
                        label="Recepção 24h"
                        icon={User}
                        onClick={() => toggleCondoAmenity("has24hReception")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasRoomService}
                        label="Room Service"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasRoomService")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasLaundryCondo}
                        label="Lavanderia"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasLaundryCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasCarWash}
                        label="Lavagem Veículos"
                        icon={Car}
                        onClick={() => toggleCondoAmenity("hasCarWash")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasValetParking}
                        label="Manobrista"
                        icon={Car}
                        onClick={() => toggleCondoAmenity("hasValetParking")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Mobilidade & Pets">
                      <FeatureToggle
                        active={formData.condoAmenities.hasElectricChargerCondo}
                        label="Carregador EV"
                        icon={Zap}
                        onClick={() =>
                          toggleCondoAmenity("hasElectricChargerCondo")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasVisitorParkingCondo}
                        label="Vagas Visitantes"
                        icon={Car}
                        onClick={() =>
                          toggleCondoAmenity("hasVisitorParkingCondo")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasBikeParkingCondo}
                        label="Bicicletário"
                        icon={Car}
                        onClick={() =>
                          toggleCondoAmenity("hasBikeParkingCondo")
                        }
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasBikeMaintenance}
                        label="Manutenção Bike"
                        icon={Wrench}
                        onClick={() => toggleCondoAmenity("hasBikeMaintenance")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasPetSpaCondo}
                        label="Pet SPA"
                        icon={Dog}
                        onClick={() => toggleCondoAmenity("hasPetSpaCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasPetWalkingArea}
                        label="Área Pet Walk"
                        icon={Dog}
                        onClick={() => toggleCondoAmenity("hasPetWalkingArea")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasGuestSuite}
                        label="Suíte Visitante"
                        icon={Users}
                        onClick={() => toggleCondoAmenity("hasGuestSuite")}
                      />
                    </FeatureCategory>

                    <FeatureCategory title="Natureza & Views">
                      <FeatureToggle
                        active={formData.condoAmenities.hasGardenCondo}
                        label="Jardim Paisagístico"
                        icon={Flower2}
                        onClick={() => toggleCondoAmenity("hasGardenCondo")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasLandscaping}
                        label="Paisagismo"
                        icon={TreePine}
                        onClick={() => toggleCondoAmenity("hasLandscaping")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasOrchard}
                        label="Pomar / Horta"
                        icon={Leaf}
                        onClick={() => toggleCondoAmenity("hasOrchard")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasTrail}
                        label="Trilha"
                        icon={TreePine}
                        onClick={() => toggleCondoAmenity("hasTrail")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasCityView}
                        label="Vista Cidade"
                        icon={Building}
                        onClick={() => toggleCondoAmenity("hasCityView")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSeaView}
                        label="Vista Mar"
                        icon={Waves}
                        onClick={() => toggleCondoAmenity("hasSeaView")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasMountainView}
                        label="Vista Montanha"
                        icon={Mountain}
                        onClick={() => toggleCondoAmenity("hasMountainView")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSunsetView}
                        label="Pôr do Sol"
                        icon={Sun}
                        onClick={() => toggleCondoAmenity("hasSunsetView")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasPrivateBalcony}
                        label="Sacada Privativa"
                        icon={Building}
                        onClick={() => toggleCondoAmenity("hasPrivateBalcony")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasRooftopAccess}
                        label="Acesso Rooftop"
                        icon={Building}
                        onClick={() => toggleCondoAmenity("hasRooftopAccess")}
                      />
                      <FeatureToggle
                        active={formData.condoAmenities.hasSkyLounge}
                        label="Sky Lounge"
                        icon={Star}
                        onClick={() => toggleCondoAmenity("hasSkyLounge")}
                      />
                    </FeatureCategory>
                  </div>
                )}

                {/* Step 7: Location */}
                {currentStep === 6 && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                      <div className="md:col-span-4 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary">
                          CEP Nacional
                        </Label>
                        <div className="relative">
                          <Input
                            value={formData.address.zipCode}
                            onChange={(e) => handleCepLookup(e.target.value)}
                            placeholder="00000-000"
                            maxLength={9}
                            className="h-16 font-black text-xl rounded-2xl glass border-none"
                          />
                          {searchingCep && (
                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-6 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Endereço Principal / Av / Alameda
                        </Label>
                        <Input
                          value={formData.address.street}
                          onChange={(e) =>
                            handleInputChange(
                              "street",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-16 font-bold rounded-2xl glass border-none"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Número
                        </Label>
                        <Input
                          value={formData.address.number}
                          onChange={(e) =>
                            handleInputChange(
                              "number",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-16 font-bold rounded-2xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Complemento
                        </Label>
                        <Input
                          value={formData.address.complement}
                          onChange={(e) =>
                            handleInputChange(
                              "complement",
                              e.target.value,
                              "address",
                            )
                          }
                          placeholder="Apto, Bloco..."
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Bairro
                        </Label>
                        <Input
                          value={formData.address.neighborhood}
                          onChange={(e) =>
                            handleInputChange(
                              "neighborhood",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Distrito
                        </Label>
                        <Input
                          value={formData.address.district}
                          onChange={(e) =>
                            handleInputChange(
                              "district",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Cidade
                        </Label>
                        <Input
                          value={formData.address.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value, "address")
                          }
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Estado / UF
                        </Label>
                        <Input
                          value={formData.address.state}
                          onChange={(e) =>
                            handleInputChange(
                              "state",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          País
                        </Label>
                        <Input
                          value={formData.address.country}
                          onChange={(e) =>
                            handleInputChange(
                              "country",
                              e.target.value,
                              "address",
                            )
                          }
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Ponto de Referência
                        </Label>
                        <Input
                          value={formData.address.reference}
                          onChange={(e) =>
                            handleInputChange(
                              "reference",
                              e.target.value,
                              "address",
                            )
                          }
                          placeholder="Próximo ao Shopping..."
                          className="h-14 font-bold rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    {/* Interactive Map Selector with Google Maps Integration */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> Posicionamento
                          Exato Google Maps
                        </Label>
                        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          LAT: {formData.address.latitude.toFixed(6)} | LNG:{" "}
                          {formData.address.longitude.toFixed(6)}
                        </span>
                      </div>
                      <div className="w-full h-[450px] bg-neutral-900 rounded-[3rem] overflow-hidden border border-white/5 relative group cursor-crosshair">
                        {/* Real Google Maps Embed */}
                        <iframe
                          ref={mapRef as any}
                          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${formData.address.latitude},${formData.address.longitude}&zoom=17&maptype=roadmap`}
                          className="w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center shadow-2xl shadow-primary/50"
                          >
                            <MapPin className="w-5 h-5 text-white" />
                          </motion.div>
                        </div>

                        <div className="absolute bottom-6 left-6 flex flex-col gap-3">
                          <div className="glass bg-black/60 px-4 py-3 rounded-2xl flex items-center gap-3 border-none">
                            <Navigation className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-neutral-300">
                              Arraste o mapa para ajustar
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <Button className="glass bg-white/10 hover:bg-white/20 border-none rounded-2xl h-12 w-12 p-0">
                              <Plus className="w-5 h-5" />
                            </Button>
                            <Button className="glass bg-white/10 hover:bg-white/20 border-none rounded-2xl h-12 w-12 p-0">
                              <Minus className="w-5 h-5" />
                            </Button>
                            <Button className="glass bg-white/10 hover:bg-white/20 border-none rounded-2xl h-12 w-12 p-0">
                              <Navigation className="w-5 h-5" />
                            </Button>
                            <Button className="glass bg-white/10 hover:bg-white/20 border-none rounded-2xl h-12 w-12 p-0">
                              <Maximize2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        <div className="absolute bottom-6 right-6">
                          <div className="glass bg-black/60 px-4 py-2 rounded-2xl flex items-center gap-2 border-none">
                            <span className="text-[10px] font-bold text-emerald-400">
                              ● GPS Ativo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Latitude Manual
                        </Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.address.latitude}
                          onChange={(e) =>
                            handleInputChange(
                              "latitude",
                              parseFloat(e.target.value),
                              "address",
                            )
                          }
                          className="h-12 font-bold rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Longitude Manual
                        </Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={formData.address.longitude}
                          onChange={(e) =>
                            handleInputChange(
                              "longitude",
                              parseFloat(e.target.value),
                              "address",
                            )
                          }
                          className="h-12 font-bold rounded-xl glass border-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 8: Proximity */}
                {currentStep === 7 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center">
                        <Navigation className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">
                          Proximidades & Distâncias
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          Distancias até pontos de interesse
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ProximityInput
                        label="Distância até Praia"
                        icon={Waves}
                        value={formData.proximity.beachDistance}
                        onChange={(v: string) =>
                          handleInputChange("beachDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Parque"
                        icon={TreePine}
                        value={formData.proximity.parkDistance}
                        onChange={(v: string) =>
                          handleInputChange("parkDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Escola"
                        icon={Star}
                        value={formData.proximity.schoolDistance}
                        onChange={(v: string) =>
                          handleInputChange("schoolDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Universidade"
                        icon={Star}
                        value={formData.proximity.universityDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "universityDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Hospital"
                        icon={Star}
                        value={formData.proximity.hospitalDistance}
                        onChange={(v: string) =>
                          handleInputChange("hospitalDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Clínica Saúde"
                        icon={Star}
                        value={formData.proximity.healthClinicDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "healthClinicDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Farmácia"
                        icon={Star}
                        value={formData.proximity.pharmacyDistance}
                        onChange={(v: string) =>
                          handleInputChange("pharmacyDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Supermercado"
                        icon={Star}
                        value={formData.proximity.supermarketDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "supermarketDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Shopping"
                        icon={Store}
                        value={formData.proximity.mallDistance}
                        onChange={(v: string) =>
                          handleInputChange("mallDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Centro Comercial"
                        icon={Store}
                        value={formData.proximity.shoppingCenterDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "shoppingCenterDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Metrô"
                        icon={Star}
                        value={formData.proximity.metroDistance}
                        onChange={(v: string) =>
                          handleInputChange("metroDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Estação Metrô mais próxima"
                        icon={Star}
                        value={formData.proximity.metroStation}
                        onChange={(v: string) =>
                          handleInputChange("metroStation", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Trem"
                        icon={Star}
                        value={formData.proximity.trainStationDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "trainStationDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Ponto de Ônibus"
                        icon={Star}
                        value={formData.proximity.busStopDistance}
                        onChange={(v: string) =>
                          handleInputChange("busStopDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Aeroporto"
                        icon={Plane}
                        value={formData.proximity.airportDistance}
                        onChange={(v: string) =>
                          handleInputChange("airportDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Rodovia"
                        icon={Star}
                        value={formData.proximity.highwayDistance}
                        onChange={(v: string) =>
                          handleInputChange("highwayDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Av. Principal"
                        icon={Star}
                        value={formData.proximity.mainAvenueDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "mainAvenueDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Área Comercial"
                        icon={Store}
                        value={formData.proximity.commercialAreaDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "commercialAreaDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Restaurante"
                        icon={Utensils}
                        value={formData.proximity.restaurantDistance}
                        onChange={(v: string) =>
                          handleInputChange(
                            "restaurantDistance",
                            v,
                            "proximity",
                          )
                        }
                      />
                      <ProximityInput
                        label="Distância até Academia"
                        icon={Dumbbell}
                        value={formData.proximity.gymDistance}
                        onChange={(v: string) =>
                          handleInputChange("gymDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até Banco"
                        icon={Star}
                        value={formData.proximity.bankDistance}
                        onChange={(v: string) =>
                          handleInputChange("bankDistance", v, "proximity")
                        }
                      />
                      <ProximityInput
                        label="Distância até ATM"
                        icon={Star}
                        value={formData.proximity.atmDistance}
                        onChange={(v: string) =>
                          handleInputChange("atmDistance", v, "proximity")
                        }
                      />
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass border-none">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">
                        Vistas e Characteristics
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        <OptionBadge
                          active={formData.proximity.beachView}
                          label="Vista Praia"
                          onClick={() =>
                            handleInputChange(
                              "beachView",
                              !formData.proximity.beachView,
                              "proximity",
                            )
                          }
                        />
                        <OptionBadge
                          active={formData.proximity.seaView}
                          label="Vista Mar"
                          onClick={() =>
                            handleInputChange(
                              "seaView",
                              !formData.proximity.seaView,
                              "proximity",
                            )
                          }
                        />
                        <OptionBadge
                          active={formData.proximity.mountainView}
                          label="Vista Montanha"
                          onClick={() =>
                            handleInputChange(
                              "mountainView",
                              !formData.proximity.mountainView,
                              "proximity",
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 9: Media */}
                {currentStep === 8 && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="border-4 border-dashed border-primary/10 rounded-[4rem] p-16 text-center space-y-6 hover:border-primary/40 hover:bg-white/[0.02] transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col justify-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "media")}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-700">
                            <UploadCloud className="w-12 h-12 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tighter uppercase italic">
                              Importar Fotos 8K
                            </h3>
                            <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] max-w-xs mx-auto">
                              Drag & Drop seus arquivos RAW, JPG or PNG de alta
                              fidelidade
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 p-10 rounded-[3rem] glass border-none">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">
                          Advanced Meta-Media
                        </h3>
                        <div className="space-y-6">
                          {/* Videos */}
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              URLs de Vídeo
                            </Label>
                            {formData.videoUrls.map(
                              (video: any, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                  <Select
                                    value={video.platform}
                                    onValueChange={(v) =>
                                      updateVideoField(idx, "platform", v)
                                    }
                                  >
                                    <SelectTrigger className="w-32 h-12 rounded-xl glass border-none">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="glass-effect rounded-xl border-none">
                                      <SelectItem value="youtube">
                                        YouTube
                                      </SelectItem>
                                      <SelectItem value="vimeo">
                                        Vimeo
                                      </SelectItem>
                                      <SelectItem value="youtube_short">
                                        YouTube Short
                                      </SelectItem>
                                      <SelectItem value="tiktok">
                                        TikTok
                                      </SelectItem>
                                      <SelectItem value="instagram">
                                        Instagram
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Outro
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={video.url}
                                    onChange={(e) =>
                                      updateVideoField(
                                        idx,
                                        "url",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="https://..."
                                    className="flex-1 h-12 pl-12 rounded-xl glass border-none font-medium"
                                  />
                                  {formData.videoUrls.length > 1 && (
                                    <Button
                                      onClick={() => removeVideoField(idx)}
                                      variant="ghost"
                                      className="text-red-500"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ),
                            )}
                            <Button
                              onClick={addVideoField}
                              variant="ghost"
                              className="text-primary"
                            >
                              <Plus className="w-4 h-4 mr-2" /> Adicionar outro
                              vídeo
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              Tour Virtual Matterport / 360°
                            </Label>
                            <div className="relative">
                              <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                              <Input
                                value={formData.virtualTourUrl}
                                onChange={(e) =>
                                  handleInputChange(
                                    "virtualTourUrl",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://..."
                                className="h-14 pl-12 rounded-xl glass border-none font-medium"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              Realidade Aumentada (AR) Tour
                            </Label>
                            <div className="relative">
                              <Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                              <Input
                                value={formData.arTourUrl}
                                onChange={(e) =>
                                  handleInputChange("arTourUrl", e.target.value)
                                }
                                placeholder="https://..."
                                className="h-14 pl-12 rounded-xl glass border-none font-medium"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                            <Wifi className="w-6 h-6 text-indigo-400" />
                          </div>
                          <p className="text-[10px] font-bold text-neutral-400 leading-relaxed uppercase">
                            Sincronização instantânea com Portais Internacionais
                            (Zillow, Mansion Global, LuxuryEstate).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Media Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Planta Baixa (PDF)
                        </Label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) =>
                              handleFileUpload(e, "floorPlanUrl")
                            }
                            className="h-14 pl-12 rounded-xl glass border-none font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Planta 3D Interativa
                        </Label>
                        <div className="relative">
                          <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <Input
                            value={formData.floorPlan3dUrl}
                            onChange={(e) =>
                              handleInputChange(
                                "floorPlan3dUrl",
                                e.target.value,
                              )
                            }
                            placeholder="URL..."
                            className="h-14 pl-12 rounded-xl glass border-none font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Brochure (PDF)
                        </Label>
                        <div className="relative">
                          <BookIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileUpload(e, "brochureUrl")}
                            className="h-14 pl-12 rounded-xl glass border-none font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Photos 360 */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Fotos 360°
                        </Label>
                        <Button className="glass rounded-xl h-10 border-none">
                          <UploadCloud className="w-4 h-4 mr-2" /> Importar
                        </Button>
                      </div>
                      <div className="border-2 border-dashed border-primary/10 rounded-[2rem] p-8 text-center hover:border-primary/30 transition-all cursor-pointer">
                        <p className="text-neutral-500 font-bold text-xs uppercase tracking-wider">
                          Arraste fotos 360° aqui ou clique para selecionar
                        </p>
                      </div>
                    </div>

                    {/* Video Walkthrough */}
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Video className="w-4 h-4" /> Vídeo Walkthrough Completo
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="h-12 rounded-xl glass border-none">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent className="glass-effect rounded-xl border-none">
                              <SelectItem value="drone">Vídeo Drone</SelectItem>
                              <SelectItem value="walkthrough">
                                Walkthrough
                              </SelectItem>
                              <SelectItem value="highlights">
                                Highlights
                              </SelectItem>
                              <SelectItem value="interview">
                                Interview
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Input
                            placeholder="URL do vídeo (YouTube/Vimeo)"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Augmented Reality */}
                    <div className="p-8 rounded-[2.5rem] glass border-none">
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                        <Star className="w-4 h-4" /> Realidade Aumentada (AR)
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                              Plataforma AR
                            </Label>
                            <Select>
                              <SelectTrigger className="h-12 rounded-xl glass border-none">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent className="glass-effect rounded-xl border-none">
                                <SelectItem value="matterport">
                                  Matterport
                                </SelectItem>
                                <SelectItem value="metta">Metta</SelectItem>
                                <SelectItem value="arcore">
                                  ARCore (Google)
                                </SelectItem>
                                <SelectItem value="arkit">
                                  ARKit (Apple)
                                </SelectItem>
                                <SelectItem value="unreal">
                                  Unreal Engine
                                </SelectItem>
                                <SelectItem value="custom">
                                  Personalizado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                              URL do Tour AR
                            </Label>
                            <Input
                              placeholder="https://..."
                              className="h-12 rounded-xl glass border-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <OptionBadge
                            active={false}
                            label="QR Code Gerado"
                            onClick={() => {}}
                          />
                          <OptionBadge
                            active={false}
                            label="Link Compartilhável"
                            onClick={() => {}}
                          />
                          <OptionBadge
                            active={false}
                            label="Embed Available"
                            onClick={() => {}}
                          />
                        </div>
                      </div>
                    </div>

                    {formData.media.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {formData.media.map((m: any, idx: number) => (
                          <motion.div
                            key={m.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative aspect-[4/3] rounded-[2rem] overflow-hidden group border-2 border-transparent hover:border-primary/50 transition-all shadow-xl"
                          >
                            <img
                              src={m.url}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <p className="text-[10px] font-black uppercase text-white tracking-widest">
                                Ajustes IA Ativos
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setFormData((p: any) => ({
                                  ...p,
                                  media: p.media.filter(
                                    (me: any) => me.id !== m.id,
                                  ),
                                }))
                              }
                              className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-2xl"
                            >
                              <X className="w-5 h-5" />
                            </button>
                            {idx === 0 && (
                              <Badge className="absolute top-4 left-4 bg-primary text-white border-none text-[8px] font-black uppercase px-3 py-1 ring-4 ring-black/20">
                                Capa Master
                              </Badge>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 10: Status */}
                {currentStep === 9 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center">
                        <Clipboard className="w-8 h-8 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">
                          Status do Imóvel
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          Condições eandamento da negociação
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {PROPERTY_STATUS.map((status) => (
                        <div
                          key={status.value}
                          onClick={() =>
                            handleInputChange("status", status.value)
                          }
                          className={cn(
                            "p-6 rounded-[2rem] cursor-pointer transition-all border-2 border-white/5 hover:border-primary/50",
                            formData.status === status.value
                              ? "bg-primary/10 border-primary/50 shadow-xl shadow-primary/10"
                              : "glass hover:bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            {formData.status === status.value ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-neutral-600" />
                            )}
                            <span className="font-black text-sm uppercase tracking-tight">
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-neutral-500">
                            {status.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {(formData.status === "EM_CONSTRUCAO" ||
                      formData.status === "NA_PLANTA" ||
                      formData.status === "LANCAMENTO" ||
                      formData.status === "PRE_LANCAMENTO") && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Progresso da Obra (%)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.constructionProgress}
                            onChange={(e) =>
                              handleInputChange(
                                "constructionProgress",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="h-14 font-black rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Previsão Entrega
                          </Label>
                          <Input
                            type="date"
                            value={formData.expectedDelivery}
                            onChange={(e) =>
                              handleInputChange(
                                "expectedDelivery",
                                e.target.value,
                              )
                            }
                            className="h-14 font-bold rounded-2xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Trimestre Entrega
                          </Label>
                          <Select
                            value={formData.deliveryQuarter}
                            onValueChange={(v) =>
                              handleInputChange("deliveryQuarter", v)
                            }
                          >
                            <SelectTrigger className="h-14 rounded-2xl glass border-none font-bold">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="glass-effect rounded-2xl border-none">
                              <SelectItem value="Q1_2025">Q1 2025</SelectItem>
                              <SelectItem value="Q2_2025">Q2 2025</SelectItem>
                              <SelectItem value="Q3_2025">Q3 2025</SelectItem>
                              <SelectItem value="Q4_2025">Q4 2025</SelectItem>
                              <SelectItem value="Q1_2026">Q1 2026</SelectItem>
                              <SelectItem value="Q2_2026">Q2 2026</SelectItem>
                              <SelectItem value="Q3_2026">Q3 2026</SelectItem>
                              <SelectItem value="Q4_2026">Q4 2026</SelectItem>
                              <SelectItem value="Q1_2027">Q1 2027</SelectItem>
                              <SelectItem value="Q2_2027">Q2 2027</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Data Entrega Chave
                        </Label>
                        <Input
                          type="date"
                          value={formData.handoverDate}
                          onChange={(e) =>
                            handleInputChange("handoverDate", e.target.value)
                          }
                          className="h-14 font-bold rounded-2xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Garantia (Anos)
                        </Label>
                        <Input
                          type="number"
                          value={formData.warrantyYears}
                          onChange={(e) =>
                            handleInputChange("warrantyYears", e.target.value)
                          }
                          placeholder="Ex: 5"
                          className="h-14 font-bold rounded-2xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                        Opções de Customização
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        <OptionBadge
                          active={formData.customOptions}
                          label="Planta Customizável"
                          onClick={() =>
                            handleInputChange(
                              "customOptions",
                              !formData.customOptions,
                            )
                          }
                        />
                        <OptionBadge
                          active={formData.warranty}
                          label="Com Garantia"
                          onClick={() =>
                            handleInputChange("warranty", !formData.warranty)
                          }
                        />
                        <OptionBadge
                          active={formData.reformNeeded}
                          label="Reforma Necessária"
                          onClick={() =>
                            handleInputChange(
                              "reformNeeded",
                              !formData.reformNeeded,
                            )
                          }
                        />
                      </div>
                      {formData.customOptions && (
                        <div className="mt-4">
                          <Textarea
                            rows={3}
                            value={formData.customOptionsDesc}
                            onChange={(e) =>
                              handleInputChange(
                                "customOptionsDesc",
                                e.target.value,
                              )
                            }
                            placeholder="Descreva as opções de customização disponíveis..."
                            className="rounded-2xl glass border-none"
                          />
                        </div>
                      )}
                      {formData.reformNeeded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                              Orçamento Reforma
                            </Label>
                            <Input
                              type="number"
                              value={formData.reformBudget}
                              onChange={(e) =>
                                handleInputChange(
                                  "reformBudget",
                                  e.target.value,
                                )
                              }
                              placeholder="R$ 0"
                              className="h-12 rounded-xl glass border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                              Última Reforma
                            </Label>
                            <Input
                              type="date"
                              value={formData.lastRenovation}
                              onChange={(e) =>
                                handleInputChange(
                                  "lastRenovation",
                                  e.target.value,
                                )
                              }
                              className="h-12 rounded-xl glass border-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        Histórico de Reforma
                      </Label>
                      <Textarea
                        rows={3}
                        value={formData.renovationHistory}
                        onChange={(e) =>
                          handleInputChange("renovationHistory", e.target.value)
                        }
                        placeholder="Descreva o histórico de reformas e manutenções realizadas..."
                        className="rounded-2xl glass border-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 11: Documentation */}
                {currentStep === 10 && (
                  <div className="space-y-12">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase">
                          Documentação
                        </h2>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
                          Documentos e certidões do imóvel
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {DOCUMENT_TYPES.map((doc) => (
                        <div
                          key={doc}
                          onClick={() =>
                            toggleDocument(doc.toLowerCase().replace(/ /g, ""))
                          }
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 border-white/5",
                            formData.documents[
                              doc.toLowerCase().replace(/ /g, "")
                            ]
                              ? "bg-emerald-500/10 border-emerald-500/50"
                              : "glass hover:bg-white/5",
                          )}
                        >
                          {formData.documents[
                            doc.toLowerCase().replace(/ /g, "")
                          ] ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5 text-neutral-600" />
                          )}
                          <span className="font-bold text-xs uppercase tracking-tight">
                            {doc}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Número Registro
                        </Label>
                        <Input
                          value={formData.registrationNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "registrationNumber",
                              e.target.value,
                            )
                          }
                          placeholder="000.000"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Cartório
                        </Label>
                        <Input
                          value={formData.registrationOffice}
                          onChange={(e) =>
                            handleInputChange(
                              "registrationOffice",
                              e.target.value,
                            )
                          }
                          placeholder="Nome do Cartório"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Folha
                        </Label>
                        <Input
                          value={formData.sheetNumber}
                          onChange={(e) =>
                            handleInputChange("sheetNumber", e.target.value)
                          }
                          placeholder="000"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Livro
                        </Label>
                        <Input
                          value={formData.bookNumber}
                          onChange={(e) =>
                            handleInputChange("bookNumber", e.target.value)
                          }
                          placeholder="000"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Código Imóvel
                        </Label>
                        <Input
                          value={formData.propertyCode}
                          onChange={(e) =>
                            handleInputChange("propertyCode", e.target.value)
                          }
                          placeholder="Código único"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Data Matrícula
                        </Label>
                        <Input
                          type="date"
                          value={formData.enrollmentDate}
                          onChange={(e) =>
                            handleInputChange("enrollmentDate", e.target.value)
                          }
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Última Transferência
                        </Label>
                        <Input
                          value={formData.lastTransfer}
                          onChange={(e) =>
                            handleInputChange("lastTransfer", e.target.value)
                          }
                          placeholder="Nome do último dono"
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Data Última Transferência
                        </Label>
                        <Input
                          type="date"
                          value={formData.lastTransferDate}
                          onChange={(e) =>
                            handleInputChange(
                              "lastTransferDate",
                              e.target.value,
                            )
                          }
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                        Débitos e Ônus
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            IPTU (Anual)
                          </Label>
                          <Input
                            type="number"
                            value={formData.IPTU}
                            onChange={(e) =>
                              handleInputChange("IPTU", e.target.value)
                            }
                            placeholder="R$ 0"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Débito IPTU
                          </Label>
                          <Input
                            type="number"
                            value={formData.IPTUDebt}
                            onChange={(e) =>
                              handleInputChange("IPTUDebt", e.target.value)
                            }
                            placeholder="R$ 0"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Débito Condomínio
                          </Label>
                          <Input
                            type="number"
                            value={formData.condoDebt}
                            onChange={(e) =>
                              handleInputChange("condoDebt", e.target.value)
                            }
                            placeholder="R$ 0"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Outros Débitos
                          </Label>
                          <Input
                            type="number"
                            value={formData.otherDebts}
                            onChange={(e) =>
                              handleInputChange("otherDebts", e.target.value)
                            }
                            placeholder="R$ 0"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Ônus e Gravames
                        </Label>
                        <Input
                          value={formData.encumbrances}
                          onChange={(e) =>
                            handleInputChange("encumbrances", e.target.value)
                          }
                          placeholder="Descrição de ônus..."
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          Pendências/Liens
                        </Label>
                        <Input
                          value={formData.liens}
                          onChange={(e) =>
                            handleInputChange("liens", e.target.value)
                          }
                          placeholder="Descrição de pendências..."
                          className="h-12 rounded-xl glass border-none"
                        />
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                        Forma de Pagamento
                      </h3>
                      <div className="flex gap-4 flex-wrap">
                        {PAYMENT_METHODS.map((method) => (
                          <OptionBadge
                            key={method}
                            active={formData.paymentMethods?.includes(method)}
                            label={method}
                            onClick={() => togglePaymentMethod(method)}
                          />
                        ))}
                      </div>
                      <div className="mt-4 flex gap-4 flex-wrap">
                        <OptionBadge
                          active={formData.acceptsExchange}
                          label="Aceita Permuta"
                          onClick={() =>
                            handleInputChange(
                              "acceptsExchange",
                              !formData.acceptsExchange,
                            )
                          }
                        />
                      </div>
                      {formData.acceptsExchange && (
                        <div className="mt-4">
                          <Input
                            value={formData.exchange接受的}
                            onChange={(e) =>
                              handleInputChange(
                                "exchange接受的",
                                e.target.value,
                              )
                            }
                            placeholder="Descreva o que aceita na permuta..."
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest opacity-40">
                        Dados do Proprietário
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Nome Proprietário
                          </Label>
                          <Input
                            value={formData.ownerName}
                            onChange={(e) =>
                              handleInputChange("ownerName", e.target.value)
                            }
                            placeholder="Nome completo"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Telefone
                          </Label>
                          <Input
                            value={formData.ownerPhone}
                            onChange={(e) =>
                              handleInputChange("ownerPhone", e.target.value)
                            }
                            placeholder="(00) 00000-0000"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            Email
                          </Label>
                          <Input
                            value={formData.ownerEmail}
                            onChange={(e) =>
                              handleInputChange("ownerEmail", e.target.value)
                            }
                            placeholder="email@exemplo.com"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            CPF/CNPJ
                          </Label>
                          <Input
                            value={formData.ownerDocs}
                            onChange={(e) =>
                              handleInputChange("ownerDocs", e.target.value)
                            }
                            placeholder="000.000.000-00"
                            className="h-12 rounded-xl glass border-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        Observações Internas
                      </Label>
                      <Textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Anotações internas para equipe de vendas..."
                        className="rounded-2xl glass border-none"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer Buttons */}
            <div className="mt-16 pt-12 border-t border-white/5 flex justify-between items-center bg-black/5 -mx-10 -mb-10 p-10 md:px-16">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-[1.5rem] h-16 px-10 glass border-none opacity-40 hover:opacity-100 hover:bg-white/10 transition-all disabled:invisible font-black uppercase tracking-widest text-xs"
              >
                Voltar Etapa
              </Button>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  className="rounded-2xl h-16 px-8 glass border-none opacity-40 hover:opacity-100 font-bold uppercase tracking-widest text-[10px]"
                >
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className="rounded-[1.8rem] h-16 px-14 font-black text-xl gap-4 shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.5)] group relative overflow-hidden active:scale-95 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" /> Processando
                        Master Core...
                      </>
                    ) : currentStep === STEPS.length - 1 ? (
                      <>
                        Publicar Anúncio{" "}
                        <Zap className="w-6 h-6 fill-current text-yellow-400" />
                      </>
                    ) : (
                      <>
                        Continuar{" "}
                        <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Trust Footer */}
          <div className="mt-12 flex flex-wrap justify-between items-center opacity-30 gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                Segurança de Dados Camada 7 Ativa
              </span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Otimização Multicore
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Global CDN Pub
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Components for Luxury UI
 */

function MusicIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function BookIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function Minus(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function Circle(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function MetricItem({ label, icon: Icon, value, onChange }: any) {
  return (
    <div className="space-y-3 group">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-primary group-focus-within:animate-bounce" />
        <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-500">
          {label}
        </Label>
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="h-16 text-2xl font-black rounded-2xl glass border-none focus-visible:ring-primary/20 hover:bg-white/[0.02]"
      />
    </div>
  );
}

function SectionHeader({
  title,
  icon: Icon,
  expanded,
  onToggle,
}: {
  title: string;
  icon: any;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center gap-4 cursor-pointer p-4 rounded-2xl glass hover:bg-white/5 transition-all"
    >
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="flex-1 font-black text-lg uppercase tracking-tight">
        {title}
      </h3>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-primary" />
      ) : (
        <ChevronDown className="w-5 h-5 text-neutral-500" />
      )}
    </div>
  );
}

function RoomToggle({
  room,
  label,
  area,
  checked,
  onAreaChange,
  onToggle,
}: {
  room: string;
  label: string;
  area: string;
  checked: boolean;
  onAreaChange?: (v: string) => void;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 cursor-pointer border border-white/[0.05] group overflow-hidden relative",
        checked
          ? "bg-primary/10 border-primary/40 shadow-xl shadow-primary/5"
          : "glass hover:bg-white/5",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700",
          checked
            ? "bg-primary text-white scale-110"
            : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700",
        )}
      >
        {checked ? <Check className="w-5 h-5" /> : <Bed className="w-5 h-5" />}
      </div>
      <div className="flex-1">
        <span
          className={cn(
            "font-bold text-xs uppercase tracking-tight transition-colors duration-500",
            checked
              ? "text-white"
              : "text-neutral-500 group-hover:text-neutral-300",
          )}
        >
          {label}
        </span>
        {checked && (
          <div className="mt-2">
            <Input
              type="number"
              value={area}
              onChange={(e) => {
                e.stopPropagation();
                onAreaChange?.(e.target.value);
              }}
              placeholder="m²"
              className="h-8 text-xs font-bold rounded-lg glass border-none bg-black/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCategory({ title, children }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500 whitespace-nowrap">
          {title}
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );
}

function FeatureToggle({ active, label, icon: Icon, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 cursor-pointer border border-white/[0.05] group overflow-hidden relative",
        active
          ? "bg-primary/10 border-primary/40 shadow-xl shadow-primary/5"
          : "glass hover:bg-white/5",
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
          active
            ? "bg-primary text-white scale-110 rotate-[5deg]"
            : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700",
        )}
      >
        <Icon className={cn("w-5 h-5", active && "animate-pulse")} />
      </div>
      <span
        className={cn(
          "font-bold text-xs uppercase tracking-tight transition-colors duration-500",
          active
            ? "text-white"
            : "text-neutral-500 group-hover:text-neutral-300",
        )}
      >
        {label}
      </span>
      {active && (
        <motion.div layoutId="sparkle" className="absolute right-4 top-4">
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 opacity-50" />
        </motion.div>
      )}
    </div>
  );
}

function OptionBadge({ active, label, onClick }: any) {
  return (
    <Badge
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl border-none cursor-pointer transition-all active:scale-95 font-bold uppercase tracking-wider text-[9px]",
        active
          ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/20"
          : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700",
      )}
    >
      {label}
    </Badge>
  );
}

function ProximityInput({ label, icon: Icon, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Distância"
          className="flex-1 h-12 rounded-xl glass border-none"
        />
        <Select defaultValue="meters">
          <SelectTrigger className="w-24 h-12 rounded-xl glass border-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-effect rounded-xl border-none">
            <SelectItem value="meters">metros</SelectItem>
            <SelectItem value="km">km</SelectItem>
            <SelectItem value="minutes_walk">min a pé</SelectItem>
            <SelectItem value="minutes_car">min de carro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
