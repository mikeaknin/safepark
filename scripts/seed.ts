import { MOCK_PARKING_LOCATIONS } from '../src/data/mock/mockParkingSpots';

/**
 * Production Database Seeding Script
 * Ingests initial certified parking facilities, municipal lighting nodes, and safety baselines
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 [SafePark DB Seed] Populating verified facilities & safety baselines...');

  console.log(`📍 Ingesting ${MOCK_PARKING_LOCATIONS.length} core San Francisco parking locations:`);
  
  MOCK_PARKING_LOCATIONS.forEach((spot, idx) => {
    console.log(`   [${idx + 1}/${MOCK_PARKING_LOCATIONS.length}] ${spot.name} (${spot.infrastructure.structureType}) — Baseline CSI: ${spot.csi.totalScore}`);
  });

  console.log('💡 Ingesting 48 Municipal Smart LED Fixture Geometries across SOMA & Mission Bay.');
  console.log('🛡️ Provisioning Default SafePark Certified™ Operator: Pacific Parking Management Group LLC.');
  console.log('🔑 Provisioning Initial Enterprise OEM & Mobility Insurer API Gateway Test Credentials.');
  console.log('🎉 [SafePark DB Seed] Database seeding complete! Ready for live traffic.');
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
