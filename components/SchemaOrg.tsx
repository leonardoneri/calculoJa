import { getAllCalculators } from '@/lib/calculators'

// Interface genérica para permitir qualquer propriedade nos esquemas JSON-LD
interface JSONLDSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export async function generateSchemaOrg(pageData?: {
  type: 'home' | 'calculator' | 'category' | 'recursos-humanos' | 'emprestimos-financiamentos' | 'sobre' | string;
  data?: any;
}) {
  const baseUrl = 'https://xn--clculoj-hwag.com.br';
  
  // Schema da Organização
  const organizationSchema: JSONLDSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CálculoJá',
    url: baseUrl,
    logo: `${baseUrl}/calculoja-logo.png`,
    sameAs: [
      // Adicione aqui suas redes sociais
    ],
    description: 'Calculadoras online gratuitas para finanças, RH, saúde e negócios.'
  };
  
  // Schema do Website
  const websiteSchema: JSONLDSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CálculoJá',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${baseUrl}/?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Schema específico para calculadoras
  let calculatorSchema: JSONLDSchema | null = null;
  if (pageData?.type === 'calculator' && pageData.data) {
    calculatorSchema = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${pageData.data.name} | CálculoJá`,
      applicationCategory: 'UtilitiesApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL'
      },
      description: pageData.data.description,
      operatingSystem: 'Web',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '250'
      }
    };
  }

  // Schema para BreadcrumbList
  let breadcrumbSchema: JSONLDSchema | null = null;
  
  // Gera breadcrumb para calculadoras
  if (pageData?.type === 'calculator' && pageData.data) {
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageData.data.category === 'health' ? 'Saúde' : 
                pageData.data.category === 'finance' ? 'Finanças' : 
                pageData.data.category === 'business' ? 'Negócios' : 'Conversão',
          item: `${baseUrl}/categoria/${pageData.data.category}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: pageData.data.name,
          item: `${baseUrl}/calculadora/${pageData.data.slug}`
        }
      ]
    };
  } 
  // Gera breadcrumb para categorias
  else if (pageData?.type === 'category' && pageData.data) {
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageData.data === 'health' ? 'Saúde' : 
                pageData.data === 'finance' ? 'Finanças' : 
                pageData.data === 'business' ? 'Negócios' : 'Conversão',
          item: `${baseUrl}/categoria/${pageData.data}`
        }
      ]
    };
  }
  // Gera breadcrumb para outras páginas
  else {
    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        }
      ]
    };

    // Adiciona breadcrumb para páginas especiais
    if (pageData?.type === 'home') {
      // Não precisa adicionar nada, já temos o Home
    } else {
      // Para outras páginas, adiciona o nome da página atual
      breadcrumbSchema.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: pageData?.type === 'recursos-humanos' ? 'Recursos Humanos' :
              pageData?.type === 'emprestimos-financiamentos' ? 'Empréstimos e Financiamentos' :
              pageData?.type === 'sobre' ? 'Sobre Nós' :
              'Página Atual',
        item: `${baseUrl}/${pageData?.type || ''}`
      });
    }
  }

  // FAQPage schema para a página home
  let faqSchema: JSONLDSchema | null = null;
  if (pageData?.type === 'home') {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'As calculadoras do CálculoJá são gratuitas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, todas as calculadoras disponíveis no CálculoJá são completamente gratuitas e podem ser utilizadas sem limitações.'
          }
        },
        {
          '@type': 'Question',
          name: 'Como posso salvar os resultados dos meus cálculos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Atualmente você pode copiar os resultados ou imprimir a página. Estamos trabalhando em uma funcionalidade para salvar os resultados em sua conta.'
          }
        },
        {
          '@type': 'Question',
          name: 'As calculadoras funcionam em dispositivos móveis?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! Todas as nossas calculadoras são responsivas e funcionam perfeitamente em smartphones e tablets.'
          }
        }
      ]
    };
  }

  // Junta todos os schemas que temos
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    breadcrumbSchema // Agora sempre incluímos o breadcrumb
  ];

  if (calculatorSchema) allSchemas.push(calculatorSchema);
  if (faqSchema) allSchemas.push(faqSchema);

  return allSchemas;
}

export function SchemaOrg({ schemas }: { schemas: JSONLDSchema[] }) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
} 