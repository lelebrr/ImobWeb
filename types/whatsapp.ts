/**
 * Tipos para WhatsApp Flows - ImobWeb 2026
 * Sistema de Conversation Flows Avançados
 */

export type ConversationState =
  | "NEW_LEAD"
  | "QUALIFICATION_IN_PROGRESS"
  | "QUALIFIED"
  | "VISIT_SCHEDULED"
  | "PROPERTY_UPDATE_30D"
  | "PROPERTY_UPDATE_45D"
  | "PROPERTY_EXPIRING"
  | "LOW_VISITS"
  | "ACTIVE"
  | "CLOSED"
  | "ARCHIVED";

export type FlowType =
  | "LEAD_QUALIFICATION"
  | "PROPERTY_UPDATE"
  | "PRICE_SUGGESTION"
  | "PHOTO_REQUEST"
  | "VISIT_CONFIRMATION"
  | "EXPIRING_REMINDER"
  | "GENERAL";

export type MessagePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type MessageDirection = "INBOUND" | "OUTBOUND" | "SYSTEM";

export type AIResponseStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "FALLBACK_NOTIFIED";

export type ConversationFlowStatus =
  | "WAITING_RESPONSE"
  | "RESPONDED"
  | "COMPLETED"
  | "EXPIRED";

export interface LeadQualificationData {
  name?: string;
  email?: string;
  phone?: string;
  budgetMin?: number;
  budgetMax?: number;
  propertyType?: string;
  desiredLocation?: string;
  visitDate?: string;
  visitTime?: string;
  notes?: string;
  score?: number;
}

export interface PropertyUpdateData {
  views30Days?: number;
  views45Days?: number;
  priceSuggestion?: number;
  marketTrend?: "up" | "down" | "stable";
  healthScore?: number;
  isExpiringSoon?: boolean;
  daysToExpire?: number;
  photoQuality?: "good" | "needs_improvement" | "poor";
  recommendations?: string[];
}

export interface ConversationFlow {
  id: string;
  type: FlowType;
  state: ConversationFlowStatus;
  contactPhone: string;
  propertyId?: string;
  leadId?: string;
  agentId?: string;
  tenantId?: string;
  lastMessageAt?: Date;
  nextActionAt?: Date;
  metadata?: Record<string, any>;
}

export interface WhatsAppMessage {
  id?: string;
  to: string;
  from: string;
  direction: MessageDirection;
  content: string;
  messageType?:
    | "text"
    | "interactive"
    | "image"
    | "video"
    | "audio"
    | "document";
  priority?: MessagePriority;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  leadId?: string;
  ownerId?: string;
  propertyId?: string;
  agentId?: string;
  tenantId?: string;
  leadData?: LeadQualificationData;
  propertyData?: PropertyUpdateData;
  flowType?: FlowType;
  state?: ConversationState;
  lastIncomingMessage?: string;
  lastOutgoingMessage?: string;
  lastResponseAt?: Date;
}

export interface AIResponseRequest {
  phoneNumber: string;
  incomingMessage: string;
  context: ConversationContext;
  templateName?: string;
}

export interface WhatsAppButton {
  id: string;
  title: string;
  description?: string;
}

export interface SuggestedActions {
  type: "BUTTON" | "LIST" | "TEXT";
  items?: WhatsAppButton[];
  buttons?: WhatsAppButton[];
}

export interface AIResponse {
  message: string;
  suggestedActions?: SuggestedActions;
  shouldUpdateCRM?: boolean;
  crmUpdates?: Record<string, any>;
  isFallback?: boolean;
  priority?: MessagePriority;
}

export interface FlowTemplate {
  id: string;
  name: string;
  type: FlowType;
  trigger: "manual" | "scheduled" | "event" | "webhook";
  conditions?: {
    daysAfterListing?: number;
    daysAfterStatusChange?: number;
    viewsBelowThreshold?: number;
    propertyExpiringInDays?: number;
  };
  messages: {
    text: string;
    interactive?: {
      type: "BUTTON" | "LIST";
      buttons?: { id: string; title: string }[];
      sections?: any[];
    };
  }[];
  actions?: {
    onRespond?: "update_crm" | "notify_agent" | "schedule_followup";
    onNoResponse?: "retry" | "escalate" | "archive";
  };
}

export interface ConversationHistoryEntry {
  id: string;
  conversationId: string;
  message: string;
  direction: MessageDirection;
  timestamp: Date;
  messageType?: string;
  metadata?: Record<string, any>;
}

export interface ProactiveMessageSchedule {
  id: string;
  propertyId: string;
  ownerId: string;
  tenantId: string;
  type: FlowType;
  scheduledFor: Date;
  executedAt?: Date;
  status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
  message?: string;
}

export interface AgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  fallbackThreshold?: number;
}

export interface WebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: any[];
        statuses?: any[];
        contacts?: any[];
      };
    }[];
  }[];
}
