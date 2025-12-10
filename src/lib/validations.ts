import { z } from "zod";

// Common validation patterns
const phoneRegex = /^(\+33|0)[1-9](\s?\d{2}){4}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==================== Contact Form ====================
export const contactFormSchema = z.object({
    name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    email: z.string()
        .email("L'adresse email n'est pas valide"),
    phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide (format: 0X XX XX XX XX)")
        .optional()
        .or(z.literal("")),
    subject: z.string()
        .min(5, "Le sujet doit contenir au moins 5 caractères")
        .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
    message: z.string()
        .min(10, "Le message doit contenir au moins 10 caractères")
        .max(2000, "Le message ne peut pas dépasser 2000 caractères"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ==================== Order Form ====================
export const orderFormSchema = z.object({
    // Pickup
    pickup_address: z.string()
        .min(5, "L'adresse de retrait doit contenir au moins 5 caractères"),
    pickup_contact_name: z.string()
        .min(2, "Le nom du contact doit contenir au moins 2 caractères")
        .optional()
        .or(z.literal("")),
    pickup_contact_phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide")
        .optional()
        .or(z.literal("")),
    pickup_instructions: z.string()
        .max(500, "Les instructions ne peuvent pas dépasser 500 caractères")
        .optional()
        .or(z.literal("")),

    // Delivery
    delivery_address: z.string()
        .min(5, "L'adresse de livraison doit contenir au moins 5 caractères"),
    delivery_contact_name: z.string()
        .min(2, "Le nom du contact doit contenir au moins 2 caractères")
        .optional()
        .or(z.literal("")),
    delivery_contact_phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide")
        .optional()
        .or(z.literal("")),
    delivery_instructions: z.string()
        .max(500, "Les instructions ne peuvent pas dépasser 500 caractères")
        .optional()
        .or(z.literal("")),

    // Package
    package_description: z.string()
        .min(3, "La description du colis est requise")
        .max(500, "La description ne peut pas dépasser 500 caractères"),
    package_weight: z.enum(["light", "medium", "heavy"]).optional(),

    // Scheduling
    is_immediate: z.boolean().default(true),
    scheduled_date: z.string().optional(),
    scheduled_time: z.string().optional(),

    // Formula
    formula: z.enum(["normal", "express", "urgence", "vl_normal", "vl_express"]).default("normal"),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;

// ==================== Guest Order Form ====================
export const guestOrderFormSchema = orderFormSchema.extend({
    // Sender info (required for guests)
    sender_name: z.string()
        .min(2, "Le nom est requis"),
    sender_email: z.string()
        .email("L'adresse email n'est pas valide"),
    sender_phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide"),
    sender_company: z.string().optional().or(z.literal("")),

    // Billing info
    billing_same_as_sender: z.boolean().default(true),
    billing_company: z.string().optional().or(z.literal("")),
    billing_address: z.string().optional().or(z.literal("")),
    billing_siret: z.string()
        .length(14, "Le SIRET doit contenir 14 chiffres")
        .optional()
        .or(z.literal("")),
});

export type GuestOrderFormData = z.infer<typeof guestOrderFormSchema>;

// ==================== Client Profile Form ====================
export const profileFormSchema = z.object({
    first_name: z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères"),
    last_name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string()
        .email("L'adresse email n'est pas valide"),
    phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide")
        .optional()
        .or(z.literal("")),
    company_name: z.string()
        .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
        .optional()
        .or(z.literal("")),
    address: z.string()
        .min(5, "L'adresse doit contenir au moins 5 caractères")
        .optional()
        .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;

// ==================== Login Form ====================
export const loginFormSchema = z.object({
    email: z.string()
        .email("L'adresse email n'est pas valide"),
    password: z.string()
        .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// ==================== Register Form ====================
export const registerFormSchema = z.object({
    first_name: z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères"),
    last_name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string()
        .email("L'adresse email n'est pas valide"),
    phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide"),
    company_name: z.string()
        .min(2, "Le nom de l'entreprise est requis"),
    password: z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

// ==================== Create Client Form (Admin) ====================
export const createClientFormSchema = z.object({
    email: z.string()
        .email("L'adresse email n'est pas valide"),
    first_name: z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères"),
    last_name: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string()
        .regex(phoneRegex, "Le numéro de téléphone n'est pas valide")
        .optional()
        .or(z.literal("")),
    company_name: z.string()
        .min(2, "Le nom de l'entreprise est requis"),
    address: z.string()
        .min(5, "L'adresse doit contenir au moins 5 caractères")
        .optional()
        .or(z.literal("")),
    sector: z.string().optional().or(z.literal("")),
    notes: z.string()
        .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
        .optional()
        .or(z.literal("")),
});

export type CreateClientFormData = z.infer<typeof createClientFormSchema>;

// ==================== Message Form ====================
export const messageFormSchema = z.object({
    subject: z.string()
        .min(3, "Le sujet doit contenir au moins 3 caractères")
        .max(200, "Le sujet ne peut pas dépasser 200 caractères"),
    content: z.string()
        .min(10, "Le message doit contenir au moins 10 caractères")
        .max(5000, "Le message ne peut pas dépasser 5000 caractères"),
});

export type MessageFormData = z.infer<typeof messageFormSchema>;
