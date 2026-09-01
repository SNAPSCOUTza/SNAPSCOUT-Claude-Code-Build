// Split out from portfolio-service.ts on purpose - that file pulls in
// lib/portfolio/instagram.ts (Node's `crypto` module, server-only), so
// importing it from client components breaks the browser bundle. This file
// has zero server-only dependencies and is safe to import from either side.

export const PORTFOLIO_DISPLAY_LIMIT = 9
// Scouts hire rather than get hired, so their "gallery" is a light profile
// touch, not a sellable portfolio - capped much lower than creator/crew/
// studio accounts.
export const SCOUT_PORTFOLIO_LIMIT = 2

export function getPortfolioUploadLimit(accountType?: string | null): number {
  return accountType === "scout" ? SCOUT_PORTFOLIO_LIMIT : PORTFOLIO_DISPLAY_LIMIT
}
