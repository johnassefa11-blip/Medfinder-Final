import { DashboardClient } from './DashboardClient';

export const metadata = {
    title: 'Pharmacy Dashboard - MedFinder',
    description: 'Manage your pharmacy inventory, medicine batches, and live availability.',
};

export default function VendorDashboardPage() {
    // Demo values for testing - these will connect directly to your Supabase pharmacy row later
    const demoPharmacyId = "00000000-0000-0000-0000-000000000000";
    const demoPharmacyName = "Central Pharmacy Addis";

    return (
        <DashboardClient 
            pharmacyId={demoPharmacyId} 
            pharmacyName={demoPharmacyName} 
        />
    );
}
