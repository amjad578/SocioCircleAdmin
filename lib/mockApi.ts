export type Role = 'super_admin' | 'shop_manager' | 'viewer';

export type Permission =
  | 'dashboard:view'
  | 'boxes:view'
  | 'boxes:create'
  | 'boxes:edit'
  | 'boxes:toggle';

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon?: string;
  requiredPermission?: Permission;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
};

export type LoginPayload = {
  email: string;
  password: string;
  redirectTo?: string;
};

export type LoginResponse = {
  token: string;
  user: User;
  menu: MenuItem[];
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ChangePasswordPayload = {
  email: string;
  oldPassword: string;
  newPassword: string;
};

let BOX_ID_SEQ = 3;

export type BoxFinishType = 'plain' | 'single_color' | 'full_print';

// Master data types
export type BoxType = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  image?: string;
};

export type BoxMaterial = {
  id: string;
  name: string;
  description?: string;
};

export type BoxCategory = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'delete';
};

// Simple pricing rules & capacity model inspired by the PDF:
// Final Price = Base Box Cost + Print Cost + Logo Setup + Quantity Multiplier + Delivery Fee
export type QuantityMultiplierRule = {
  minQty: number;
  multiplier: number;
};

export type DeliverySpeed = 'standard' | 'express';

export type PricingRules = {
  printCostPerUnit: number;
  logoSetupFee: number;
  quantityMultipliers: QuantityMultiplierRule[];
  deliveryFees: Record<DeliverySpeed, number>;
};

export type Box = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  length: number;
  width: number;
  height: number;
  boxTypeId?: string;
  materialId?: string;
  boxCategoryId?: string;
  material: string;
  gsm: number;
  baseCost: number;
  // ... (rest of Box fields)
  dailyMaxCapacity: number;
  currentDayBooked: number;
  pricingRules: PricingRules;
  allowLogoUpload: boolean;
  allowTextPrinting: boolean;
  allowColorSelection: boolean;
  finishTypes: BoxFinishType[];
  active: boolean;
  images: string[];
  dielineFiles?: string[];
};

let BOX_TYPE_ID_SEQ = 3;
let MATERIAL_ID_SEQ = 3;
let BOX_CATEGORY_ID_SEQ = 3;

let boxTypes: BoxType[] = [
  { id: 'bt1', name: 'Universal Box', description: 'Universal box packaging', active: true },
  { id: 'bt2', name: 'Rigid Box', description: 'Rigid box packaging', active: true },
  { id: 'bt3', name: 'Gift Box', description: 'Gift packaging', active: true },
  { id: 'bt4', name: 'Food Box', description: 'Food packaging', active: false }
];

let materials: BoxMaterial[] = [
  { id: 'mat1', name: 'Corrugated', description: 'Standard corrugated board' },
  { id: 'mat2', name: 'Rigid', description: 'Premium rigid board' },
  { id: 'mat3', name: 'Kraft', description: 'Kraft paperboard' }
];

let boxCategories: BoxCategory[] = [
  { id: 'bc1', name: 'E-commerce', description: 'Online order packaging', status: 'active' },
  { id: 'bc2', name: 'Gifts', description: 'Gift and premium packaging', status: 'active' },
  { id: 'bc3', name: 'Food', description: 'Food and bakery boxes', status: 'inactive' }
];

let boxes: Box[] = [
  {
    id: '1',
    name: 'E-commerce Mailer Box - Small',
    sku: 'SG-SM-BOX-001',
    description: 'Small corrugated mailer box ideal for lightweight ecommerce shipments.',
    length: 20,
    width: 15,
    height: 5,
    boxTypeId: 'bt1',
    materialId: 'mat1',
    boxCategoryId: 'bc1',
    material: 'Corrugated',
    gsm: 350,
    baseCost: 12,
    dailyMaxCapacity: 1000,
    currentDayBooked: 850,
    pricingRules: {
      printCostPerUnit: 3,
      logoSetupFee: 150,
      quantityMultipliers: [
        { minQty: 1, multiplier: 1 },
        { minQty: 100, multiplier: 0.95 },
        { minQty: 500, multiplier: 0.9 }
      ],
      deliveryFees: {
        standard: 120,
        express: 220
      }
    },
    allowLogoUpload: true,
    allowTextPrinting: true,
    allowColorSelection: true,
    finishTypes: ['plain', 'single_color', 'full_print'],
    active: true,
    images: [],
    dielineFiles: []
  },
  {
    id: '2',
    name: 'Rigid Gift Box - Medium',
    sku: 'SG-RG-BOX-010',
    description: 'Premium rigid box for gifting and luxury products.',
    length: 25,
    width: 20,
    height: 10,
    boxTypeId: 'bt2',
    materialId: 'mat2',
    boxCategoryId: 'bc2',
    material: 'Rigid',
    gsm: 1200,
    baseCost: 45,
    dailyMaxCapacity: 300,
    currentDayBooked: 300,
    pricingRules: {
      printCostPerUnit: 8,
      logoSetupFee: 300,
      quantityMultipliers: [
        { minQty: 1, multiplier: 1 },
        { minQty: 50, multiplier: 0.93 },
        { minQty: 200, multiplier: 0.88 }
      ],
      deliveryFees: {
        standard: 180,
        express: 320
      }
    },
    allowLogoUpload: true,
    allowTextPrinting: true,
    allowColorSelection: false,
    finishTypes: ['plain', 'single_color'],
    active: true,
    images: [],
    dielineFiles: []
  }
];

const DEMO_USERS: Record<string, { password: string; user: User; menu: MenuItem[] }> = {
  'admin@studio.com': {
    password: 'admin123',
    user: {
      id: 'u1',
      name: 'Super Admin',
      email: 'admin@studio.com',
      role: 'super_admin',
      permissions: ['dashboard:view', 'boxes:view', 'boxes:create', 'boxes:edit', 'boxes:toggle']
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        requiredPermission: 'dashboard:view'
      },
      {
        id: 'boxes',
        label: 'Shop Box Manager',
        path: '/boxes',
        icon: 'boxes',
        requiredPermission: 'boxes:view'
      },
      {
        id: 'box-types',
        label: 'Box Types',
        path: '/box-types',
        icon: 'categories',
        requiredPermission: 'boxes:view'
      },
      {
        id: 'box-categories',
        label: 'Box Categories',
        path: '/box-categories',
        icon: 'gsm',
        requiredPermission: 'boxes:view'
      },
      {
        id: 'materials',
        label: 'Box Materials',
        path: '/materials',
        icon: 'materials',
        requiredPermission: 'boxes:view'
      }
    ]
  },
  'manager@studio.com': {
    password: 'manager123',
    user: {
      id: 'u2',
      name: 'Shop Manager',
      email: 'manager@studio.com',
      role: 'shop_manager',
      permissions: ['dashboard:view', 'boxes:view', 'boxes:edit', 'boxes:toggle']
    },
    menu: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        requiredPermission: 'dashboard:view'
      },
      {
        id: 'boxes',
        label: 'Shop Box Manager',
        path: '/boxes',
        icon: 'boxes',
        requiredPermission: 'boxes:view'
      }
    ]
  }
};

const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  await simulateDelay();
  const record = DEMO_USERS[payload.email];
  if (!record || record.password !== payload.password) {
    throw new Error('Invalid email or password');
  }
  return {
    token: 'mock-token-' + record.user.id,
    user: record.user,
    menu: record.menu
  };
}

export async function forgotPasswordApi(_payload: ForgotPasswordPayload): Promise<void> {
  await simulateDelay(600);
}

export async function changePasswordApi(payload: ChangePasswordPayload): Promise<void> {
  await simulateDelay(400);
  const record = DEMO_USERS[payload.email];
  if (!record || record.password !== payload.oldPassword) {
    throw new Error('Old password is incorrect');
  }
  record.password = payload.newPassword;
}

// Box Type master
export async function listBoxTypes(): Promise<BoxType[]> {
  await simulateDelay();
  return [...boxTypes];
}

export async function getBoxTypeById(id: string): Promise<BoxType | null> {
  await simulateDelay();
  return boxTypes.find((c) => c.id === id) ?? null;
}

export type UpsertBoxTypeInput = Omit<BoxType, 'id'>;

export async function createBoxType(input: UpsertBoxTypeInput): Promise<BoxType> {
  await simulateDelay();
  const boxType: BoxType = { ...input, id: `bt${++BOX_TYPE_ID_SEQ}` };
  boxTypes.push(boxType);
  return boxType;
}

export async function updateBoxType(id: string, input: UpsertBoxTypeInput): Promise<BoxType> {
  await simulateDelay();
  const idx = boxTypes.findIndex((c) => c.id === id);
  if (idx === -1) {
    throw new Error('Box Type not found');
  }
  const updated: BoxType = { ...input, id };
  boxTypes[idx] = updated;
  return updated;
}

// Box material master
export async function listMaterials(): Promise<BoxMaterial[]> {
  await simulateDelay();
  return [...materials];
}

export async function getMaterialById(id: string): Promise<BoxMaterial | null> {
  await simulateDelay();
  return materials.find((m) => m.id === id) ?? null;
}

export type UpsertMaterialInput = Omit<BoxMaterial, 'id'>;

export async function createMaterial(input: UpsertMaterialInput): Promise<BoxMaterial> {
  await simulateDelay();
  const material: BoxMaterial = { ...input, id: `mat${++MATERIAL_ID_SEQ}` };
  materials.push(material);
  return material;
}

export async function updateMaterial(id: string, input: UpsertMaterialInput): Promise<BoxMaterial> {
  await simulateDelay();
  const idx = materials.findIndex((m) => m.id === id);
  if (idx === -1) {
    throw new Error('Material not found');
  }
  const updated: BoxMaterial = { ...input, id };
  materials[idx] = updated;
  return updated;
}

// Box Category master
export async function listBoxCategories(): Promise<BoxCategory[]> {
  await simulateDelay();
  return [...boxCategories];
}

export async function getBoxCategoryById(id: string): Promise<BoxCategory | null> {
  await simulateDelay();
  return boxCategories.find((g) => g.id === id) ?? null;
}

export type UpsertBoxCategoryInput = Omit<BoxCategory, 'id'>;

export async function createBoxCategory(input: UpsertBoxCategoryInput): Promise<BoxCategory> {
  await simulateDelay();
  const category: BoxCategory = { ...input, id: `bc${++BOX_CATEGORY_ID_SEQ}` };
  boxCategories.push(category);
  return category;
}

export async function updateBoxCategory(id: string, input: UpsertBoxCategoryInput): Promise<BoxCategory> {
  await simulateDelay();
  const idx = boxCategories.findIndex((g) => g.id === id);
  if (idx === -1) {
    throw new Error('Box Category not found');
  }
  const updated: BoxCategory = { ...input, id };
  boxCategories[idx] = updated;
  return updated;
}

export async function listBoxes(): Promise<Box[]> {
  await simulateDelay();
  return [...boxes];
}

export async function getBoxById(id: string): Promise<Box | null> {
  await simulateDelay();
  return boxes.find((b) => b.id === id) ?? null;
}

export type UpsertBoxInput = Omit<Box, 'id'>;

export async function createBox(input: UpsertBoxInput): Promise<Box> {
  await simulateDelay();
  const newBox: Box = {
    ...input,
    id: String(++BOX_ID_SEQ)
  };
  boxes.push(newBox);
  return newBox;
}

export async function updateBox(id: string, input: UpsertBoxInput): Promise<Box> {
  await simulateDelay();
  const index = boxes.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('Box not found');
  }
  const updated: Box = { ...input, id };
  boxes[index] = updated;
  return updated;
}

export async function setBoxActive(id: string, active: boolean): Promise<Box> {
  await simulateDelay();
  const box = boxes.find((b) => b.id === id);
  if (!box) {
    throw new Error('Box not found');
  }
  box.active = active;
  return box;
}

export function isBoxOutOfCapacity(box: Box): boolean {
  return box.currentDayBooked >= box.dailyMaxCapacity;
}

export type PriceCalculationInput = {
  quantity: number;
  includeLogo: boolean;
  deliverySpeed: DeliverySpeed;
};

export function calculateBoxPrice(box: Box, input: PriceCalculationInput): number {
  const { quantity, includeLogo, deliverySpeed } = input;
  const rules = box.pricingRules;

  const baseBoxCostTotal = box.baseCost * quantity;
  const printCostTotal = rules.printCostPerUnit * quantity;
  const logoCost = includeLogo ? rules.logoSetupFee : 0;

  const applicableMultiplier =
    rules.quantityMultipliers
      .filter((r) => quantity >= r.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0]?.multiplier ?? 1;

  const deliveryFee = rules.deliveryFees[deliverySpeed] ?? 0;

  const subtotal = baseBoxCostTotal + printCostTotal + logoCost;
  const withQtyMultiplier = subtotal * applicableMultiplier;

  const finalPrice = withQtyMultiplier + deliveryFee;
  return Math.round(finalPrice * 100) / 100;
}
