import { copy } from '@zarinpulse/contracts';

export function healthLabel(code: string): string {
  if (Object.prototype.hasOwnProperty.call(copy.health, code)) {
    return copy.health[code as keyof typeof copy.health];
  }
  return copy.health.healthy;
}

export function healthAction(code: string): string {
  if (Object.prototype.hasOwnProperty.call(copy.healthAction, code)) {
    return copy.healthAction[code as keyof typeof copy.healthAction];
  }
  return copy.healthAction.healthy;
}
