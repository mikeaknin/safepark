import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSFPoliceService } from '../infrastructure/api/DataSFPoliceService';
import { SF311Service } from '../infrastructure/api/SF311Service';

describe('Live DataSF Police Incident & SF 311 Municipal Telemetry Services', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    DataSFPoliceService.clearCache();
    SF311Service.clearCache();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('handles DataSF Police API responses and parses vehicle larceny records', async () => {
    const mockPoliceRows = [
      {
        row_id: 'sf-inc-1',
        incident_datetime: new Date().toISOString(),
        incident_category: 'Larceny Theft',
        incident_description: 'Theft From Locked Vehicle (Smash and Grab)',
        latitude: '37.7842',
        longitude: '-122.4015',
      },
      {
        row_id: 'sf-inc-2',
        incident_datetime: new Date().toISOString(),
        incident_category: 'Motor Vehicle Theft',
        incident_description: 'Vehicle Theft',
        latitude: '37.7845',
        longitude: '-122.4018',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPoliceRows,
    } as any);

    const summary = await DataSFPoliceService.fetchIncidentsNearCoordinates(
      { lat: 37.7842, lng: -122.4015 },
      500
    );

    expect(summary.isLive).toBe(true);
    expect(summary.incidentsLast90Days).toBe(2);
    expect(summary.vehicleLarcenyCount30Days).toBe(2);
    expect(summary.smashAndGrabCount).toBe(1);
    expect(summary.incidents.length).toBe(2);
  });

  it('gracefully falls back when DataSF Police API fails or is offline', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const summary = await DataSFPoliceService.fetchIncidentsNearCoordinates(
      { lat: 37.7842, lng: -122.4015 },
      500
    );

    expect(summary.isLive).toBe(false);
    expect(summary.incidentsLast30Days).toBe(0);
    expect(summary.incidents.length).toBe(0);
  });

  it('handles SF 311 API responses and flags active streetlight outages', async () => {
    const mock311Rows = [
      {
        service_request_id: '311-case-1',
        service_name: 'Streetlight - Light Out on Sidewalk',
        service_details: 'Lamp flickering and completely unlit',
        status: 'Open',
        requested_datetime: new Date().toISOString(),
        lat: '37.7842',
        long: '-122.4015',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mock311Rows,
    } as any);

    const summary = await SF311Service.fetchMunicipalCasesNearCoordinates(
      { lat: 37.7842, lng: -122.4015 },
      250
    );

    expect(summary.isLive).toBe(true);
    expect(summary.hasStreetlightOutage).toBe(true);
    expect(summary.openStreetlightOutagesCount).toBe(1);
    expect(summary.cases.length).toBe(1);
  });

  it('gracefully falls back when SF 311 API fails or is offline', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('311 API timeout'));

    const summary = await SF311Service.fetchMunicipalCasesNearCoordinates(
      { lat: 37.7842, lng: -122.4015 },
      250
    );

    expect(summary.isLive).toBe(false);
    expect(summary.hasStreetlightOutage).toBe(false);
    expect(summary.cases.length).toBe(0);
  });
});
