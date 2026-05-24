/**
 * Central API client for the Gift Studio Admin Panel.
 * All functions read the JWT token from localStorage and attach it as a Bearer token.
 */

const API_URL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:8181/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = window.localStorage.getItem('socio-admin-auth');
        if (!stored) return null;
        const parsed = JSON.parse(stored) as { token?: string };
        return parsed.token ?? null;
    } catch {
        return null;
    }
}

function buildAuthHeaders(extra?: Record<string, string>): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = {
        ...extra,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// ─── Generic fetch wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = buildAuthHeaders(
        isFormData ? {} : { 'Content-Type': 'application/json' }
    );

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string> | undefined),
        },
    });

    if (!res.ok) {
        // On 401, clear stored session and redirect to login
        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('socio-admin-auth');
                window.location.href = '/login';
            }
        }

        let message = `Request failed: ${res.status}`;
        try {
            const json = await res.json();
            message = json?.message ?? json?.error ?? message;
        } catch {
            // ignore parse errors
        }
        throw new Error(message);
    }

    return res.json() as Promise<T>;
}


// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiStatus = 'active' | 'inactive' | 'delete';

export type ApiUser = {
    _id: string;
    name: string;
    email: string;
    role: string;
};

export type ApiLoginResponse = {
    statusCode: number;
    message: string;
    data: {
        token: string;
        name: string;
        email: string;
        role: string;
        _id: string;
    };
};

export type ApiBoxCategory = {
    _id: string;
    name: string;
    description?: string;
    status: ApiStatus;
};

export type ApiBoxType = {
    _id: string;
    name: string;
    description?: string;
    status: ApiStatus;
    image?: string;
};

export type ApiBoxMaterial = {
    _id: string;
    name: string;
    description?: string;
    status: ApiStatus;
};

export type ApiListResponse<T> = {
    statusCode: number;
    message: string;
    data: {
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type ApiSingleResponse<T> = {
    statusCode: number;
    message: string;
    data: T;
};

// ─── Box Management Types ───────────────────────────────────────────────────

export type ApiBox = {
    _id: string;
    name: string;
    slug: string;
    shortDescription: string;
    longDescription?: string;
    categoryId: string | ApiBoxCategory;
    typeId: string | ApiBoxType;
    materialId: string | ApiBoxMaterial;
    ecoFriendly: boolean;
    minimalWastage: boolean;
    sheetOptimization?: {
        sheetSize: string;
        boxesPerSheet: number;
        wastagePercent: number;
    };
    status: ApiStatus;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiBoxVariant = {
    _id: string;
    boxId: string;
    sku: string;
    dimension: {
        length: number;
        width: number;
        height: number;
        label: string;
    };
    gsm: number;
    basePrice: number;
    moq: number;
    stock: number;
    ecoFriendly: boolean;
    minimalWastage: boolean;
    status: ApiStatus;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiPricingRule = {
    _id: string;
    variantId: string;
    minQty: number;
    maxQty: number;
    price: number;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiBoxImage = {
    _id: string;
    boxId: string;
    imageUrl: string;
    mediaType?: 'image' | 'video';
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiBoxAccordion = {
    _id: string;
    boxId: string;
    title: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiBoxAdminDetails = {
    box: ApiBox;
    images: ApiBoxImage[];
    variants: ApiBoxVariant[];
    accordions: ApiBoxAccordion[];
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(
    email: string,
    password: string
): Promise<ApiLoginResponse> {
    const basicUser = import.meta.env.VITE_ADMIN_BASIC_USER ?? '';
    const basicPass = import.meta.env.VITE_ADMIN_BASIC_PASS ?? '';
    const basicToken = btoa(`${basicUser}:${basicPass}`);

    const res = await fetch(`${API_URL}/admins/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicToken}`,
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        let message = 'Invalid email or password';
        try {
            const json = await res.json();
            message = json?.message ?? json?.error ?? message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return res.json() as Promise<ApiLoginResponse>;
}

export async function apiChangePassword(
    oldPassword: string,
    newPassword: string
): Promise<void> {
    await apiFetch('/admins/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
    });
}

// ─── Box Categories ───────────────────────────────────────────────────────────

export async function apiListBoxCategories(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiBoxCategory[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiListResponse<ApiBoxCategory>>(
        `/box-categories${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetBoxCategory(id: string): Promise<ApiBoxCategory> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxCategory>>(
        `/box-categories/${id}`
    );
    return res.data;
}

export async function apiCreateBoxCategory(payload: {
    name: string;
    description?: string;
    status?: ApiStatus;
}): Promise<ApiBoxCategory> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxCategory>>(
        '/box-categories',
        { method: 'POST', body: JSON.stringify(payload) }
    );
    return res.data;
}

export async function apiUpdateBoxCategory(
    id: string,
    payload: { name: string; description?: string; status: ApiStatus }
): Promise<ApiBoxCategory> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxCategory>>(
        `/box-categories/${id}`,
        { method: 'PUT', body: JSON.stringify(payload) }
    );
    return res.data;
}

export async function apiDeleteBoxCategory(id: string): Promise<void> {
    await apiFetch(`/box-categories/${id}`, { method: 'DELETE' });
}

// ─── Box Types ────────────────────────────────────────────────────────────────

export async function apiListBoxTypes(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiBoxType[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiListResponse<ApiBoxType>>(
        `/box-types${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetBoxType(id: string): Promise<ApiBoxType> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxType>>(`/box-types/${id}`);
    return res.data;
}

export async function apiCreateBoxType(payload: {
    name: string;
    description?: string;
    status?: ApiStatus;
    imageFile?: File | null;
}): Promise<ApiBoxType> {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.description) form.append('description', payload.description);
    if (payload.status) form.append('status', payload.status);
    if (payload.imageFile) form.append('image', payload.imageFile);

    const res = await apiFetch<ApiSingleResponse<ApiBoxType>>('/box-types', {
        method: 'POST',
        body: form,
    });
    return res.data;
}

export async function apiUpdateBoxType(
    id: string,
    payload: {
        name: string;
        description?: string;
        status: ApiStatus;
        imageFile?: File | null;
    }
): Promise<ApiBoxType> {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.description) form.append('description', payload.description);
    form.append('status', payload.status);
    if (payload.imageFile) form.append('image', payload.imageFile);

    const res = await apiFetch<ApiSingleResponse<ApiBoxType>>(
        `/box-types/${id}`,
        { method: 'PUT', body: form }
    );
    return res.data;
}

export async function apiDeleteBoxType(id: string): Promise<void> {
    await apiFetch(`/box-types/${id}`, { method: 'DELETE' });
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export type ApiBannerRedirectType = 'box_list' | 'box';

export type ApiBanner = {
    _id: string;
    title: string;
    image: string;
    redirectType: ApiBannerRedirectType;
    boxId?: string;
    boxTypeId?: string;
    position: number;
    status: ApiStatus;
    createdAt?: string;
    updatedAt?: string;
};

export async function apiListBanners(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiBanner[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiListResponse<ApiBanner>>(
        `/banners${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetBanner(id: string): Promise<ApiBanner> {
    const res = await apiFetch<ApiSingleResponse<ApiBanner>>(`/banners/${id}`);
    return res.data;
}

export async function apiCreateBanner(payload: {
    title: string;
    redirectType: ApiBannerRedirectType;
    boxId?: string;
    boxTypeId?: string;
    position: number;
    status?: ApiStatus;
    imageFile?: File | null;
}): Promise<ApiBanner> {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('redirectType', payload.redirectType);
    form.append('position', String(payload.position));
    if (payload.boxId) form.append('boxId', payload.boxId);
    if (payload.boxTypeId) form.append('boxTypeId', payload.boxTypeId);
    if (payload.status) form.append('status', payload.status);
    if (payload.imageFile) form.append('image', payload.imageFile);

    const res = await apiFetch<ApiSingleResponse<ApiBanner>>('/banners', {
        method: 'POST',
        body: form,
    });
    return res.data;
}

export async function apiUpdateBanner(
    id: string,
    payload: {
        title: string;
        redirectType: ApiBannerRedirectType;
        boxId?: string;
        boxTypeId?: string;
        position: number;
        status: ApiStatus;
        imageFile?: File | null;
    }
): Promise<ApiBanner> {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('redirectType', payload.redirectType);
    form.append('position', String(payload.position));
    form.append('status', payload.status);
    if (payload.boxId) form.append('boxId', payload.boxId);
    if (payload.boxTypeId) form.append('boxTypeId', payload.boxTypeId);
    if (payload.imageFile) form.append('image', payload.imageFile);

    const res = await apiFetch<ApiSingleResponse<ApiBanner>>(
        `/banners/${id}`,
        { method: 'PUT', body: form }
    );
    return res.data;
}

export async function apiDeleteBanner(id: string): Promise<void> {
    await apiFetch(`/banners/${id}`, { method: 'DELETE' });
}

// ─── Box Materials ────────────────────────────────────────────────────────────

export async function apiListBoxMaterials(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiBoxMaterial[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiListResponse<ApiBoxMaterial>>(
        `/box-materials${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetBoxMaterial(id: string): Promise<ApiBoxMaterial> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxMaterial>>(
        `/box-materials/${id}`
    );
    return res.data;
}

export async function apiCreateBoxMaterial(payload: {
    name: string;
    description?: string;
    status?: ApiStatus;
}): Promise<ApiBoxMaterial> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxMaterial>>(
        '/box-materials',
        { method: 'POST', body: JSON.stringify(payload) }
    );
    return res.data;
}

export async function apiUpdateBoxMaterial(
    id: string,
    payload: { name: string; description?: string; status: ApiStatus }
): Promise<ApiBoxMaterial> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxMaterial>>(
        `/box-materials/${id}`,
        { method: 'PUT', body: JSON.stringify(payload) }
    );
    return res.data;
}

export async function apiDeleteBoxMaterial(id: string): Promise<void> {
    await apiFetch(`/box-materials/${id}`, { method: 'DELETE' });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export type ApiQueryStatus = 'under_review' | 'pending' | 'resolved' | 'closed' | 'delete';

export type ApiQuery = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    description?: string;
    remarks?: string;
    media?: string[];
    status: ApiQueryStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiQueryListResponse = {
    statusCode: number;
    message: string;
    data: {
        data: ApiQuery[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export async function apiListQueries(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiQuery[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiQueryListResponse>(
        `/queries${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetQuery(id: string): Promise<ApiQuery> {
    const res = await apiFetch<ApiSingleResponse<ApiQuery>>(`/queries/${id}`);
    return res.data;
}

export async function apiCreateQuery(payload: {
    name: string;
    email: string;
    phone: string;
    description?: string;
    remarks?: string;
    status?: ApiQueryStatus;
    mediaFiles?: File[];
}): Promise<ApiQuery> {
    const form = new FormData();
    form.append('name', payload.name);
    form.append('email', payload.email);
    form.append('phone', payload.phone);
    if (payload.description) form.append('description', payload.description);
    if (payload.remarks) form.append('remarks', payload.remarks);
    if (payload.status) form.append('status', payload.status);
    if (payload.mediaFiles?.length) {
        payload.mediaFiles.forEach((file) => form.append('media', file));
    }

    const res = await apiFetch<ApiSingleResponse<ApiQuery>>('/queries', {
        method: 'POST',
        body: form,
    });
    return res.data;
}

export async function apiUpdateQuery(
    id: string,
    payload: {
        name?: string;
        email?: string;
        phone?: string;
        description?: string;
        remarks?: string;
        status?: ApiQueryStatus;
        mediaFiles?: File[];
        existingMedia?: string[];
    }
): Promise<ApiQuery> {
    const requestPayload: any = {};
    if (payload.name) requestPayload['name'] = payload.name
    if (payload.email) requestPayload['email'] = payload.email
    if (payload.phone) requestPayload['phone'] = payload.phone
    if (payload.description !== undefined) requestPayload['description'] = payload.description
    if (payload.remarks !== undefined) requestPayload['remarks'] = payload.remarks
    if (payload.status) requestPayload['status'] = payload.status

    const res = await apiFetch<ApiSingleResponse<ApiQuery>>(
        `/queries/${id}`,
        { method: 'PUT', body: JSON.stringify(requestPayload) }
    );
    return res.data;
}

export async function apiDeleteQuery(id: string): Promise<void> {
    await apiFetch(`/queries/${id}`, { method: 'DELETE' });
}

// ─── Boxes ────────────────────────────────────────────────────────────────────

export async function apiListBoxes(params?: {
    search?: string;
    status?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: ApiBox[]; total: number; page: number; limit: number; totalPages: number }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status) q.set('status', params.status);
    if (params?.categoryId) q.set('categoryId', params.categoryId);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();

    const res = await apiFetch<ApiListResponse<ApiBox>>(
        `/admin/boxes${qs ? `?${qs}` : ''}`
    );
    return res.data;
}

export async function apiGetBoxAdminDetails(id: string): Promise<ApiBoxAdminDetails> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxAdminDetails>>(`/admin/boxes/${id}`);
    return res.data;
}

export async function apiCreateBox(payload: Partial<ApiBox>): Promise<ApiBox> {
    const res = await apiFetch<ApiSingleResponse<ApiBox>>('/admin/boxes', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiUpdateBox(id: string, payload: Partial<ApiBox>): Promise<ApiBox> {
    const res = await apiFetch<ApiSingleResponse<ApiBox>>(`/admin/boxes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiDeleteBox(id: string): Promise<void> {
    await apiFetch(`/admin/boxes/${id}`, { method: 'DELETE' });
}

// ─── Box Images ───────────────────────────────────────────────────────────────

export async function apiAddBoxImages(boxId: string, files: File[]): Promise<ApiBoxImage[]> {
    const form = new FormData();
    files.forEach((file) => form.append('media', file));

    const res = await apiFetch<ApiSingleResponse<{ images: ApiBoxImage[] }>>(`/admin/boxes/${boxId}/images`, {
        method: 'POST',
        body: form,
    });
    return res.data.images;
}

export async function apiRemoveBoxImage(id: string): Promise<void> {
    await apiFetch(`/admin/images/${id}`, { method: 'DELETE' });
}

// ─── Box Variants ─────────────────────────────────────────────────────────────

export async function apiGetVariants(boxId: string): Promise<ApiBoxVariant[]> {
    const res = await apiFetch<ApiSingleResponse<{ variants: ApiBoxVariant[] }>>(`/admin/variants/${boxId}`);
    return res.data.variants;
}

export async function apiCreateVariant(payload: Partial<ApiBoxVariant>): Promise<ApiBoxVariant> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxVariant>>('/admin/variants', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiUpdateVariant(id: string, payload: Partial<ApiBoxVariant>): Promise<ApiBoxVariant> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxVariant>>(`/admin/variants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return res.data;
}

// ─── Pricing Rules ────────────────────────────────────────────────────────────

export async function apiGetPricingRules(variantId: string): Promise<ApiPricingRule[]> {
    const res = await apiFetch<ApiSingleResponse<{ rules: ApiPricingRule[] }>>(`/admin/pricing-rules/${variantId}`);
    return res.data.rules;
}

export async function apiCreatePricingRule(payload: Partial<ApiPricingRule>): Promise<ApiPricingRule> {
    const res = await apiFetch<ApiSingleResponse<ApiPricingRule>>('/admin/pricing-rules', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiUpdatePricingRule(id: string, payload: Partial<ApiPricingRule>): Promise<ApiPricingRule> {
    const res = await apiFetch<ApiSingleResponse<ApiPricingRule>>(`/admin/pricing-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return res.data;
}

// ─── Box Accordions ───────────────────────────────────────────────────────────

export async function apiAddAccordion(boxId: string, payload: { title: string; description: string }): Promise<ApiBoxAccordion> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxAccordion>>(`/admin/boxes/${boxId}/accordions`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiUpdateAccordion(id: string, payload: { title?: string; description?: string }): Promise<ApiBoxAccordion> {
    const res = await apiFetch<ApiSingleResponse<ApiBoxAccordion>>(`/admin/accordions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return res.data;
}

export async function apiDeleteAccordion(id: string): Promise<void> {
    await apiFetch(`/admin/accordions/${id}`, { method: 'DELETE' });
}
