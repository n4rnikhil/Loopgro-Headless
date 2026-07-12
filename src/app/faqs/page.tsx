import { getFAQs } from "@/lib/sheets";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const metadata = {
  title: "FAQs | Loopgro Store",
  description: "Frequently Asked Questions about orders, shipping, and products.",
};

export default async function FAQsPage() {
  const faqs = await getFAQs();

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    const category = faq.category || "General";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Decorative Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="mt-4 text-base text-color-secondary max-w-2xl mx-auto">
          Find answers to common inquiries about sizing, orders, international shipping, and store policies.
        </p>
      </div>

      {Object.entries(groupedFAQs).length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border-primary rounded-xl">
          <p className="text-color-secondary">No FAQs available at this moment. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedFAQs).map(([category, items]) => (
            <div key={category} className="bg-background-secondary border border-solid border-border-primary rounded-xl p-6 md:p-8 transition-all hover:border-[#3E3E3E]">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 text-white border-b border-border-primary pb-3">
                {category}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {items.map((item, index) => {
                  const itemKey = `${category}-${index}`;
                  return (
                    <AccordionItem key={itemKey} value={itemKey} className="border-b border-[#222] last:border-b-0">
                      <AccordionTrigger className="text-left text-sm font-semibold py-4 text-white hover:text-gray-300 transition-colors">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-color-secondary text-sm leading-relaxed pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
