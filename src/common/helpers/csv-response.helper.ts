import type { Response } from 'express';

export function sendCsvResponse(response: Response, csv: string, filename: string): void {
  response.setHeader('Content-Type', 'text/csv');
  response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  response.send(csv);
}
