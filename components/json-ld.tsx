type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders an inline JSON-LD structured-data <script> tag (WebSite,
 * BreadcrumbList, TechArticle/LearningResource).
 *
 * "<" is escaped so section content can never break out of the script element
 * (e.g. a title containing "</script>").
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}