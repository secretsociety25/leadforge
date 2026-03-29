export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-8">Earn 60% Recurring Commission</h1>
        <p className="text-2xl text-zinc-400 mb-12">
          Join the LeadForge Partner Program.<br />
          Refer customers to LeadForge and earn 60% of every subscription they pay — every month, forever.
        </p>
        <a 
          href="/partners/apply" 
          className="bg-violet-600 hover:bg-violet-700 px-12 py-5 rounded-2xl text-xl font-medium inline-block"
        >
          Apply to Become a Partner →
        </a>
      </div>
    </div>
  );
}
