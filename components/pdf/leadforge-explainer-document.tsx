import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

/** Marketing-friendly AED / month (from USD list × ~3.67). */
const PRICING_AED = {
  starter: 180,
  pro: 363,
  enterprise: 914,
} as const;

const colors = {
  bg: "#09090b",
  surface: "#18181b",
  border: "#3f3f46",
  text: "#fafafa",
  muted: "#a1a1aa",
  dim: "#71717a",
  accent: "#8b5cf6",
  accentSoft: "#4c1d95",
  teal: "#2dd4bf",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
  },
  pageNumber: {
    position: "absolute",
    bottom: 24,
    right: 48,
    fontSize: 9,
    color: colors.dim,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    lineHeight: 1.15,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 1.55,
    maxWidth: 480,
    marginBottom: 28,
  },
  visualPlaceholder: {
    marginTop: 8,
    height: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  visualInner: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#27272a",
    borderWidth: 1,
    borderColor: "#52525b",
    padding: 12,
  },
  mockRow: {
    flexDirection: "row",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#3f3f46",
    paddingBottom: 6,
  },
  mockCell: {
    fontSize: 7,
    color: colors.dim,
    width: "33%",
  },
  mockCellAccent: {
    fontSize: 7,
    color: colors.teal,
    width: "34%",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 8,
  },
  sectionLead: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 24,
    lineHeight: 1.5,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  stepNum: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ddd6fe",
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 10,
    color: colors.muted,
    lineHeight: 1.45,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.accentSoft,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIconText: {
    fontSize: 12,
    color: "#c4b5fd",
    fontFamily: "Helvetica-Bold",
  },
  featureLabel: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  tierCol: {
    width: "31%",
  },
  tierCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    minHeight: 140,
  },
  tierCardPopular: {
    borderColor: colors.accent,
    borderWidth: 2,
    paddingTop: 10,
  },
  popularBadge: {
    alignSelf: "center",
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  popularBadgeText: {
    fontSize: 7,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tierName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  tierPrice: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 4,
  },
  tierHint: {
    fontSize: 8,
    color: colors.dim,
  },
  ctaBox: {
    marginTop: 28,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  ctaLink: {
    fontSize: 11,
    color: colors.teal,
    marginBottom: 12,
    textDecoration: "none",
  },
  disclaimer: {
    fontSize: 8,
    color: colors.dim,
    textAlign: "center",
    lineHeight: 1.4,
    maxWidth: 420,
  },
  footerBrand: {
    marginTop: 32,
    fontSize: 8,
    color: colors.dim,
    textAlign: "center",
  },
});

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

export function LeadForgeExplainerDocument() {
  return (
    <Document
      title="LeadForge — Product Explainer"
      author="MTDFIX"
      subject="AI-Powered B2B Lead Generation"
      creator="LeadForge"
    >
      {/* Page 1 — Hero */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>LeadForge · MTDFIX</Text>
        <Text style={styles.heroTitle}>
          LeadForge — AI-Powered{"\n"}B2B Lead Generation
        </Text>
        <Text style={styles.heroSubtitle}>
          Upload your leads. Get hyper-personalized cold emails in minutes. One workspace for CSV
          import, AI drafting, and export — built for reps who outgrow templates.
        </Text>

        <View style={styles.visualPlaceholder}>
          <Text style={{ fontSize: 8, color: colors.dim, marginBottom: 8 }}>Dashboard preview</Text>
          <View style={styles.visualInner}>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ fontSize: 7, color: colors.muted, width: "33%" }}>Name</Text>
              <Text style={{ fontSize: 7, color: colors.muted, width: "33%" }}>Company</Text>
              <Text style={{ fontSize: 7, color: colors.muted, width: "34%" }}>AI draft</Text>
            </View>
            <View style={styles.mockRow}>
              <Text style={styles.mockCell}>Alex R.</Text>
              <Text style={styles.mockCell}>Acme Ltd</Text>
              <Text style={styles.mockCellAccent}>Saw your post on…</Text>
            </View>
            <View style={styles.mockRow}>
              <Text style={styles.mockCell}>Jamie K.</Text>
              <Text style={styles.mockCell}>Globex</Text>
              <Text style={styles.mockCellAccent}>Quick thought on…</Text>
            </View>
            <View style={[styles.mockRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.mockCell}>…</Text>
              <Text style={styles.mockCell}>…</Text>
              <Text style={styles.mockCellAccent}>…</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerBrand}>leadforge · confidential overview</Text>
        <Text style={styles.pageNumber}>1 / 4</Text>
      </Page>

      {/* Page 2 — How it works */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>How it works</Text>
        <Text style={styles.sectionTitle}>From CSV to send-ready copy</Text>
        <Text style={styles.sectionLead}>
          Three simple steps — no complex stack. Bring your list; LeadForge handles the rest.
        </Text>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Upload your CSV</Text>
            <Text style={styles.stepText}>
              Drop a file from Apollo, Sales Navigator, or any export. Map columns once (name,
              company, LinkedIn, email).
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>AI analyzes context & writes emails</Text>
            <Text style={styles.stepText}>
              Our models read the signal you provide and produce short, natural cold emails — not
              generic mail-merge paragraphs.
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>Export ready-to-send emails</Text>
            <Text style={styles.stepText}>
              Download a CSV with your original fields plus the final draft column. Plug into
              Instantly, Lemlist, or your sequencer.
            </Text>
          </View>
        </View>

        <Text style={styles.footerBrand}>leadforge · confidential overview</Text>
        <Text style={styles.pageNumber}>2 / 4</Text>
      </Page>

      {/* Page 3 — Features */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Product</Text>
        <Text style={styles.sectionTitle}>What you get</Text>
        <Text style={styles.sectionLead}>
          Built for outbound teams who want quality at scale — without another bloated sales tool.
        </Text>

        <FeatureItem icon="◇" label="Smart column mapper — match CSV headers to LeadForge fields in seconds." />
        <FeatureItem icon="◎" label="Three depth levels of personalization — from light touch to richer context." />
        <FeatureItem icon="✉" label="Full cold email generation — structured, peer-to-peer tone, low-friction CTAs." />
        <FeatureItem icon="⎘" label="One-click export to CSV — original data plus AI draft column." />
        <FeatureItem icon="◉" label="Usage & quota tracking — stay inside your plan with clear limits in-app." />

        <Text style={styles.footerBrand}>leadforge · confidential overview</Text>
        <Text style={styles.pageNumber}>3 / 4</Text>
      </Page>

      {/* Page 4 — Pricing + CTA */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Pricing</Text>
        <Text style={styles.sectionTitle}>Simple tiers (AED / month)</Text>
        <Text style={styles.sectionLead}>
          List pricing shown in UAE dirhams. Annual billing and other currencies available on the site.
        </Text>

        <View style={styles.pricingRow}>
          <View style={[styles.tierCol, styles.tierCard]}>
            <Text style={styles.tierName}>Starter</Text>
            <Text style={styles.tierPrice}>{PRICING_AED.starter} AED</Text>
            <Text style={styles.tierHint}>per month · entry scale</Text>
          </View>

          <View style={[styles.tierCol, styles.tierCard, styles.tierCardPopular]}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Most popular</Text>
            </View>
            <Text style={styles.tierName}>Pro</Text>
            <Text style={styles.tierPrice}>{PRICING_AED.pro} AED</Text>
            <Text style={styles.tierHint}>per month · growing teams</Text>
          </View>

          <View style={[styles.tierCol, styles.tierCard]}>
            <Text style={styles.tierName}>Enterprise</Text>
            <Text style={styles.tierPrice}>{PRICING_AED.enterprise} AED</Text>
            <Text style={styles.tierHint}>per month · high volume</Text>
          </View>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to 10x your outreach?</Text>
          <Link src="https://www.mtdfix.co.uk">
            <Text style={styles.ctaLink}>https://www.mtdfix.co.uk</Text>
          </Link>
          <Text style={styles.disclaimer}>
            LeadForge is an independent AI tool. You bring the data, we bring the intelligence.
            Always comply with applicable laws and platform terms when using contact data.
          </Text>
        </View>

        <Text style={[styles.footerBrand, { marginTop: 24 }]}>© LeadForge · MTDFIX Services Ltd.</Text>
        <Text style={styles.pageNumber}>4 / 4</Text>
      </Page>
    </Document>
  );
}
