import { z } from "zod";

const nonEmptyString = z.string().min(1);

const backendAlertSchema = z.object({
  id: nonEmptyString,
  timestamp: nonEmptyString,
  severity: nonEmptyString,
  attack_type: nonEmptyString,
  source_ip: nonEmptyString,
  destination_ip: z.string().default(""),
  destination_port: z.number().optional().default(0),
  protocol: z.string().optional().default("TCP"),
  confidence_score: z.number().optional().default(0),
  risk_score: z.number().optional().default(0),
}).catchall(z.unknown());

const legacyAlertSchema = z.object({
  id: nonEmptyString,
  timestamp: nonEmptyString,
  severity: nonEmptyString,
  attackType: nonEmptyString,
  sourceIp: nonEmptyString,
}).catchall(z.unknown());

export const alertPayloadSchema = z.union([backendAlertSchema, legacyAlertSchema]);

export const trafficUpdateSchema = z.object({
  timestamp: z.string().default(""),
  formattedTime: z.string().optional(),
  flows: z.number().default(0),
  anomalies: z.number().default(0),
  inbound: z.number().default(0),
  outbound: z.number().default(0),
  isAnomaly: z.boolean().optional(),
  isPeak: z.boolean().optional(),
});

export const socketMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("INITIAL_DATA"), data: z.array(alertPayloadSchema) }),
  z.object({ type: z.literal("NEW_ALERT"), data: alertPayloadSchema }),
  z.object({ type: z.literal("alert.created"), data: alertPayloadSchema }),
  z.object({ type: z.literal("alert.updated"), data: alertPayloadSchema }),
  z.object({ type: z.literal("TRAFFIC_UPDATE"), data: trafficUpdateSchema }),
]);

export type ValidSocketMessage = z.infer<typeof socketMessageSchema>;
