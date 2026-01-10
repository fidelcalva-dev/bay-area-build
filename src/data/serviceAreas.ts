export interface CityData {
  name: string;
  slug: string;
  description: string;
  highlights: string[];
  faqs: { question: string; answer: string }[];
}

export interface CountyData {
  name: string;
  slug: string;
  cities: CityData[];
}

export const serviceAreas: CountyData[] = [
  {
    name: 'Alameda County',
    slug: 'alameda',
    cities: [
      {
        name: 'Oakland',
        slug: 'oakland',
        description: 'As the largest city in the East Bay, Oakland sees high demand for construction debris removal, home renovation clean-outs, and commercial waste disposal. We offer same-day dumpster delivery throughout Oakland neighborhoods from Downtown to the Hills.',
        highlights: ['Same-day delivery available', 'All Oakland neighborhoods served', 'Construction & renovation specialists'],
        faqs: [
          { question: 'Do I need a permit for a dumpster in Oakland?', answer: 'If placing the dumpster on a public street, you may need a street use permit from the City of Oakland. Dumpsters on private property typically don\'t require permits.' },
          { question: 'What sizes are popular in Oakland?', answer: 'For Oakland homes, 10-15 yard dumpsters are most popular. Larger construction projects often use 20-30 yard containers.' },
        ],
      },
      {
        name: 'Fremont',
        slug: 'fremont',
        description: 'Fremont is one of the Bay Area\'s fastest-growing cities with ongoing residential development. We provide reliable dumpster service for new construction, landscaping projects, and estate cleanouts throughout Fremont.',
        highlights: ['New construction specialists', 'Residential & commercial service', 'Weekend delivery available'],
        faqs: [
          { question: 'How fast can I get a dumpster in Fremont?', answer: 'We typically offer same-day or next-day delivery in Fremont. Call by 10am for same-day service.' },
          { question: 'Can you deliver to gated communities in Fremont?', answer: 'Yes, we deliver to all gated communities. Just provide gate code or arrange access with security.' },
        ],
      },
      {
        name: 'Berkeley',
        slug: 'berkeley',
        description: 'From UC Berkeley campus projects to residential renovations in the hills, we serve all of Berkeley with flexible dumpster rental options. Our drivers are familiar with Berkeley\'s narrow streets and permit requirements.',
        highlights: ['University project experience', 'Narrow street access capable', 'Eco-friendly disposal options'],
        faqs: [
          { question: 'Are there special rules for dumpsters in Berkeley?', answer: 'Berkeley has strict environmental guidelines. We ensure proper sorting and disposal at certified facilities.' },
          { question: 'Can you deliver to the Berkeley Hills?', answer: 'Yes, our trucks can navigate hill roads. We\'ll confirm the best placement location for your property.' },
        ],
      },
      {
        name: 'Hayward',
        slug: 'hayward',
        description: 'Serving Hayward homeowners, contractors, and businesses with reliable roll-off dumpster service. Quick turnaround for industrial areas and residential neighborhoods alike.',
        highlights: ['Industrial area specialists', 'Quick turnaround times', 'Competitive pricing'],
        faqs: [
          { question: 'What areas of Hayward do you serve?', answer: 'We cover all Hayward including downtown, industrial district, Hayward Hills, and all residential neighborhoods.' },
          { question: 'Do you offer contractor rates in Hayward?', answer: 'Yes, we offer volume discounts and priority scheduling for contractors with ongoing projects.' },
        ],
      },
      {
        name: 'San Leandro',
        slug: 'san-leandro',
        description: 'San Leandro\'s mix of residential and industrial properties makes it ideal for our full range of dumpster sizes. From small garage cleanouts to large warehouse demolitions, we\'ve got you covered.',
        highlights: ['Residential & industrial service', 'Full size range available', 'Flexible rental periods'],
        faqs: [
          { question: 'What\'s the most popular dumpster size in San Leandro?', answer: 'The 15-yard dumpster is popular for home projects. Industrial clients often need 30-40 yard containers.' },
          { question: 'How long can I keep the dumpster?', answer: 'Standard rental is 7 days. Extensions available at $50/day.' },
        ],
      },
      {
        name: 'Livermore',
        slug: 'livermore',
        description: 'We provide dumpster rental service to Livermore and the Tri-Valley area. Perfect for wine country estate projects, new home construction, and commercial developments.',
        highlights: ['Tri-Valley coverage', 'Wine country experience', 'Large project capability'],
        faqs: [
          { question: 'Is there an extra charge for Livermore delivery?', answer: 'Livermore is within our standard service area. No extra distance charges apply.' },
          { question: 'Can you handle winery renovation debris?', answer: 'Absolutely. We work with many Livermore Valley wineries on renovation and construction projects.' },
        ],
      },
      {
        name: 'Pleasanton',
        slug: 'pleasanton',
        description: 'Pleasanton\'s upscale neighborhoods and active commercial areas keep our dumpsters busy. We offer discreet placement and prompt service for this growing Tri-Valley community.',
        highlights: ['Upscale neighborhood experience', 'Discreet placement options', 'Prompt pickups'],
        faqs: [
          { question: 'Do you deliver to downtown Pleasanton?', answer: 'Yes, we navigate downtown Pleasanton regularly. We\'ll work with you on optimal placement timing.' },
          { question: 'What about HOA communities in Pleasanton?', answer: 'We\'re experienced with HOA requirements and can coordinate placement to meet community guidelines.' },
        ],
      },
      {
        name: 'Union City',
        slug: 'union-city',
        description: 'Union City residents and businesses benefit from our central East Bay location for fast dumpster delivery. Ideal for home remodels, business cleanouts, and construction debris.',
        highlights: ['Central location advantage', 'Fast response times', 'All dumpster sizes'],
        faqs: [
          { question: 'What\'s the delivery time to Union City?', answer: 'Same-day delivery is typically available. We\'re centrally located for quick Union City service.' },
          { question: 'Can I place a dumpster on my driveway?', answer: 'Yes, driveway placement is common. We recommend plywood to protect your driveway surface.' },
        ],
      },
    ],
  },
  {
    name: 'San Francisco',
    slug: 'san-francisco',
    cities: [
      {
        name: 'Downtown SF',
        slug: 'downtown-sf',
        description: 'Downtown San Francisco presents unique challenges with tight streets and permit requirements. Our experienced drivers handle Financial District, Union Square, and SOMA deliveries with precision.',
        highlights: ['Permit assistance available', 'Tight space specialists', 'Off-hours delivery'],
        faqs: [
          { question: 'Are permits required in Downtown SF?', answer: 'Yes, street permits are required from SFMTA. We can guide you through the permit process.' },
          { question: 'Can you deliver during business hours?', answer: 'We offer early morning and evening deliveries to minimize disruption in busy downtown areas.' },
        ],
      },
      {
        name: 'Mission District',
        slug: 'mission',
        description: 'The Mission\'s vibrant mix of residential, commercial, and industrial properties makes it a frequent destination for our dumpsters. We navigate narrow streets and handle diverse project types.',
        highlights: ['Narrow street navigation', 'Diverse project experience', 'Hablamos Español'],
        faqs: [
          { question: 'Do you have Spanish-speaking drivers for Mission?', answer: 'Sí, hablamos español. Many of our team members are bilingual for your convenience.' },
          { question: 'What size works for Mission flats?', answer: 'For apartment/flat renovations, 10-15 yard dumpsters are most common due to space constraints.' },
        ],
      },
      {
        name: 'Sunset District',
        slug: 'sunset',
        description: 'The Sunset\'s row houses and residential character mean lots of home improvement projects. We\'re the go-to for Sunset homeowners tackling renovations, cleanouts, and landscaping.',
        highlights: ['Residential specialists', 'Row house experience', 'Neighborly service'],
        faqs: [
          { question: 'Can dumpsters fit on Sunset driveways?', answer: 'Yes, our 10-15 yard dumpsters fit most Sunset driveways. We\'ll assess the best fit for your property.' },
          { question: 'How do I avoid blocking neighbors?', answer: 'We position dumpsters carefully to maintain neighbor access. Garage placement is often ideal.' },
        ],
      },
      {
        name: 'Richmond District',
        slug: 'richmond',
        description: 'From the Inner Richmond to the Outer Richmond and Sea Cliff, we provide dumpster service throughout this diverse San Francisco neighborhood. Perfect for home projects and cleanouts.',
        highlights: ['Full Richmond coverage', 'Sea Cliff capable', 'Weekend availability'],
        faqs: [
          { question: 'Do you serve all of Richmond District?', answer: 'Yes, from Arguello to the ocean, including Sea Cliff and all avenues.' },
          { question: 'What about foggy/wet conditions?', answer: 'Our drivers are experienced with SF weather. Deliveries proceed rain or shine.' },
        ],
      },
      {
        name: 'SOMA',
        slug: 'soma',
        description: 'SOMA\'s mix of tech offices, residential lofts, and construction sites keeps us busy. We handle commercial buildouts, residential renovations, and large-scale construction debris removal.',
        highlights: ['Commercial buildout experts', 'Loft renovation experience', 'Large project capacity'],
        faqs: [
          { question: 'Can you handle tech office buildouts?', answer: 'Absolutely. We work with many tech companies on office construction and renovation debris removal.' },
          { question: 'What about loading dock deliveries?', answer: 'Yes, we can coordinate loading dock deliveries for commercial buildings.' },
        ],
      },
      {
        name: 'Potrero Hill',
        slug: 'potrero-hill',
        description: 'Potrero Hill\'s hillside homes and growing development make it perfect for our dumpster service. We navigate steep streets and provide reliable service for this sunny SF neighborhood.',
        highlights: ['Hill navigation experts', 'Growing area coverage', 'Reliable scheduling'],
        faqs: [
          { question: 'Can trucks handle Potrero Hill streets?', answer: 'Yes, our drivers are experienced with SF hills. We\'ll assess the best delivery route.' },
          { question: 'Is there construction nearby I should know about?', answer: 'Potrero is actively developing. We stay updated on construction impacts for deliveries.' },
        ],
      },
    ],
  },
  {
    name: 'Santa Clara County',
    slug: 'santa-clara',
    cities: [
      {
        name: 'San Jose',
        slug: 'san-jose',
        description: 'As the Bay Area\'s largest city, San Jose keeps our fleet busy with residential, commercial, and industrial projects. From Willow Glen to Evergreen, we cover all San Jose neighborhoods.',
        highlights: ['Bay Area\'s largest city', 'All neighborhoods covered', 'Same-day available'],
        faqs: [
          { question: 'Do you cover all of San Jose?', answer: 'Yes, every neighborhood from downtown to Almaden Valley to Berryessa and beyond.' },
          { question: 'What permits are needed in San Jose?', answer: 'Street placement requires a permit from San Jose DOT. Private property placement typically doesn\'t.' },
        ],
      },
      {
        name: 'Sunnyvale',
        slug: 'sunnyvale',
        description: 'Sunnyvale\'s tech campuses and residential neighborhoods generate steady demand for dumpster service. We handle everything from data center cleanouts to backyard renovation projects.',
        highlights: ['Tech campus experience', 'Residential & commercial', 'Quick response'],
        faqs: [
          { question: 'Do you work with Sunnyvale tech companies?', answer: 'Yes, we serve many tech campuses for construction, renovation, and e-waste projects.' },
          { question: 'What\'s typical pricing for Sunnyvale?', answer: 'Sunnyvale is in our core service area with standard competitive pricing. Get an instant quote online.' },
        ],
      },
      {
        name: 'Mountain View',
        slug: 'mountain-view',
        description: 'Home to major tech headquarters and charming downtown, Mountain View sees diverse dumpster needs. From Google campus projects to Castro Street renovations, we\'re ready to serve.',
        highlights: ['Downtown capable', 'Tech HQ experience', 'Flexible scheduling'],
        faqs: [
          { question: 'Can you deliver near downtown Mountain View?', answer: 'Yes, we navigate downtown regularly and can coordinate timing for busy areas.' },
          { question: 'What size for typical home projects?', answer: 'Mountain View homes typically need 10-20 yard dumpsters depending on project scope.' },
        ],
      },
      {
        name: 'Palo Alto',
        slug: 'palo-alto',
        description: 'Palo Alto\'s upscale properties and active renovation scene make it a frequent destination. We understand the community\'s expectations for professional, discreet service.',
        highlights: ['Upscale service experience', 'Stanford area coverage', 'Professional presentation'],
        faqs: [
          { question: 'Do you serve near Stanford?', answer: 'Yes, we cover all Palo Alto including areas near Stanford campus.' },
          { question: 'What about historic home renovations?', answer: 'We\'re experienced with the careful debris handling required for historic property renovations.' },
        ],
      },
      {
        name: 'Santa Clara',
        slug: 'santa-clara',
        description: 'Santa Clara\'s mix of residential, commercial, and industrial zones keeps our dumpsters in high demand. From Levi\'s Stadium area to residential neighborhoods, we\'ve got coverage.',
        highlights: ['Industrial zone experience', 'Stadium area coverage', 'Commercial specialists'],
        faqs: [
          { question: 'Do you serve Santa Clara industrial areas?', answer: 'Yes, we\'re experienced with industrial zone deliveries and large commercial projects.' },
          { question: 'What about events near Levi\'s Stadium?', answer: 'We can coordinate delivery timing around event schedules when needed.' },
        ],
      },
      {
        name: 'Cupertino',
        slug: 'cupertino',
        description: 'Cupertino\'s family neighborhoods and tech presence create steady demand for home renovation and commercial project dumpsters. We provide reliable service throughout.',
        highlights: ['Family neighborhood focus', 'Apple area coverage', 'Reliable service'],
        faqs: [
          { question: 'How quickly can you deliver to Cupertino?', answer: 'Same-day delivery is usually available. Call before 10am for best availability.' },
          { question: 'Do you cover all Cupertino?', answer: 'Yes, every neighborhood from Rancho Rinconada to Monta Vista and beyond.' },
        ],
      },
    ],
  },
  {
    name: 'Contra Costa County',
    slug: 'contra-costa',
    cities: [
      {
        name: 'Concord',
        slug: 'concord',
        description: 'Concord\'s central Contra Costa location makes it a hub for our East Bay service. We handle residential cleanouts, commercial projects, and construction debris throughout the city.',
        highlights: ['Central CC location', 'Quick response times', 'Full size range'],
        faqs: [
          { question: 'What\'s typical delivery time to Concord?', answer: 'Same-day or next-day delivery is typically available for Concord.' },
          { question: 'Do you serve Concord BART area?', answer: 'Yes, we cover all Concord including downtown and areas near BART.' },
        ],
      },
      {
        name: 'Walnut Creek',
        slug: 'walnut-creek',
        description: 'Walnut Creek\'s upscale homes and active downtown generate steady demand. We provide professional dumpster service matching the community\'s high standards.',
        highlights: ['Upscale community experience', 'Downtown navigation', 'Professional service'],
        faqs: [
          { question: 'Can you deliver to downtown Walnut Creek?', answer: 'Yes, we\'re experienced navigating downtown. We\'ll coordinate optimal delivery timing.' },
          { question: 'What about hillside homes?', answer: 'Our drivers handle Walnut Creek hills regularly. We\'ll assess access for your property.' },
        ],
      },
      {
        name: 'Richmond',
        slug: 'richmond',
        description: 'Richmond\'s diverse neighborhoods from Point Richmond to Hilltop keep us busy. We serve residential, commercial, and industrial projects throughout the city.',
        highlights: ['Full city coverage', 'Industrial experience', 'Diverse project types'],
        faqs: [
          { question: 'Do you serve Richmond industrial areas?', answer: 'Yes, we regularly deliver to Richmond\'s industrial zones and port-adjacent areas.' },
          { question: 'What about Point Richmond?', answer: 'Point Richmond is fully covered. We navigate the historic streets regularly.' },
        ],
      },
      {
        name: 'Antioch',
        slug: 'antioch',
        description: 'As one of Contra Costa\'s fastest-growing cities, Antioch sees active new construction and renovation. We provide reliable dumpster service for this expanding community.',
        highlights: ['Growing area coverage', 'New construction specialists', 'Competitive rates'],
        faqs: [
          { question: 'Is Antioch in your service area?', answer: 'Yes, Antioch is fully within our service area with no extra distance charges.' },
          { question: 'Do you serve new developments?', answer: 'Yes, we work with builders on new construction throughout Antioch.' },
        ],
      },
      {
        name: 'San Ramon',
        slug: 'san-ramon',
        description: 'San Ramon\'s master-planned communities and business parks require professional dumpster service. We understand HOA requirements and corporate property standards.',
        highlights: ['HOA experience', 'Business park service', 'Professional standards'],
        faqs: [
          { question: 'Do you work with San Ramon HOAs?', answer: 'Yes, we coordinate with HOAs on placement guidelines and timing requirements.' },
          { question: 'What about Bishop Ranch business park?', answer: 'We serve Bishop Ranch and other San Ramon business parks regularly.' },
        ],
      },
      {
        name: 'Pittsburg',
        slug: 'pittsburg',
        description: 'Pittsburg\'s revitalizing downtown and residential areas make it a growing market for dumpster service. We provide reliable, affordable options for all project types.',
        highlights: ['Revitalizing area coverage', 'Affordable rates', 'All project types'],
        faqs: [
          { question: 'What sizes are available for Pittsburg?', answer: 'We offer our full range from 8 to 40 yards throughout Pittsburg.' },
          { question: 'How does pricing compare?', answer: 'Pittsburg is standard pricing, no extra charges. Get an instant quote online.' },
        ],
      },
    ],
  },
  {
    name: 'San Mateo County',
    slug: 'san-mateo',
    cities: [
      {
        name: 'Daly City',
        slug: 'daly-city',
        description: 'Daly City\'s dense residential neighborhoods and proximity to SF make it perfect for our dumpster service. We navigate the city\'s hillside streets with expertise.',
        highlights: ['SF-adjacent coverage', 'Hillside navigation', 'Dense neighborhood experience'],
        faqs: [
          { question: 'Do you cover Westlake area?', answer: 'Yes, all Daly City including Westlake, Serramonte, and Broadmoor.' },
          { question: 'Can you navigate steep streets?', answer: 'Our drivers are experienced with Daly City\'s terrain.' },
        ],
      },
      {
        name: 'San Mateo',
        slug: 'san-mateo',
        description: 'San Mateo\'s central Peninsula location and mix of housing types create diverse dumpster needs. From downtown condos to hillside homes, we cover it all.',
        highlights: ['Central Peninsula', 'Diverse housing coverage', 'Quick Peninsula response'],
        faqs: [
          { question: 'How fast can you deliver to San Mateo?', answer: 'Same-day delivery is typically available for San Mateo.' },
          { question: 'Do you cover downtown condos?', answer: 'Yes, we work with condo buildings and can coordinate loading zone use.' },
        ],
      },
      {
        name: 'Redwood City',
        slug: 'redwood-city',
        description: 'Redwood City\'s booming development and diverse neighborhoods keep our dumpsters busy. From downtown tech offices to residential renovation, we\'re ready.',
        highlights: ['Booming development area', 'Downtown experience', 'Tech office capability'],
        faqs: [
          { question: 'Do you serve downtown Redwood City?', answer: 'Yes, we navigate downtown regularly including the active development areas.' },
          { question: 'What about Emerald Hills?', answer: 'Emerald Hills is fully covered. Our drivers handle the hillside access.' },
        ],
      },
      {
        name: 'South San Francisco',
        slug: 'south-san-francisco',
        description: 'South SF\'s biotech campus and industrial areas generate commercial demand, while residential neighborhoods need renovation support. We cover both.',
        highlights: ['Biotech corridor coverage', 'Industrial experience', 'Residential service'],
        faqs: [
          { question: 'Do you serve SSF biotech companies?', answer: 'Yes, we work with biotech and pharmaceutical companies on construction and cleanout projects.' },
          { question: 'What about near SFO?', answer: 'We cover all South SF including areas near the airport.' },
        ],
      },
      {
        name: 'Menlo Park',
        slug: 'menlo-park',
        description: 'Menlo Park\'s mix of tech headquarters, Stanford-adjacent neighborhoods, and upscale homes creates steady demand for professional dumpster service.',
        highlights: ['Tech HQ experience', 'Stanford-adjacent', 'Upscale service'],
        faqs: [
          { question: 'Do you serve near Facebook/Meta?', answer: 'Yes, we cover all Menlo Park including areas near major tech campuses.' },
          { question: 'What about Atherton-adjacent areas?', answer: 'Yes, we serve the upscale neighborhoods throughout Menlo Park.' },
        ],
      },
      {
        name: 'Half Moon Bay',
        slug: 'half-moon-bay',
        description: 'Half Moon Bay and the coast side require a provider who knows the route. We serve this beautiful coastal community with reliable dumpster delivery.',
        highlights: ['Coastside coverage', 'Route-experienced', 'Reliable scheduling'],
        faqs: [
          { question: 'Is there extra charge for Half Moon Bay?', answer: 'Half Moon Bay is in our service area at standard pricing.' },
          { question: 'Do you serve farms and ranches?', answer: 'Yes, we deliver to agricultural properties throughout the coastside.' },
        ],
      },
    ],
  },
  {
    name: 'Marin County',
    slug: 'marin',
    cities: [
      {
        name: 'San Rafael',
        slug: 'san-rafael',
        description: 'As Marin\'s largest city and county seat, San Rafael sees diverse dumpster needs from commercial downtown to residential neighborhoods. We cover it all.',
        highlights: ['Marin\'s largest city', 'Commercial & residential', 'Full coverage'],
        faqs: [
          { question: 'Do you serve downtown San Rafael?', answer: 'Yes, we navigate downtown regularly and can coordinate delivery timing.' },
          { question: 'What about the Canal district?', answer: 'Yes, the Canal area is fully covered. Hablamos español.' },
        ],
      },
      {
        name: 'Novato',
        slug: 'novato',
        description: 'Novato\'s family-friendly neighborhoods and active development make it a frequent destination. We provide reliable service throughout North Marin.',
        highlights: ['North Marin coverage', 'Family neighborhood focus', 'Development specialists'],
        faqs: [
          { question: 'How far north in Novato do you go?', answer: 'We cover all of Novato including areas near the Sonoma County line.' },
          { question: 'Do you serve Hamilton?', answer: 'Yes, Hamilton and all Novato neighborhoods are covered.' },
        ],
      },
      {
        name: 'Mill Valley',
        slug: 'mill-valley',
        description: 'Mill Valley\'s hillside homes and narrow roads require experienced drivers. We navigate with care and provide professional service for this special community.',
        highlights: ['Hillside specialists', 'Narrow road capable', 'Professional service'],
        faqs: [
          { question: 'Can your trucks handle Mill Valley roads?', answer: 'Yes, our drivers are experienced with Mill Valley\'s unique terrain.' },
          { question: 'What about Tam Valley?', answer: 'Tam Valley is fully covered as part of our Mill Valley service.' },
        ],
      },
      {
        name: 'Sausalito',
        slug: 'sausalito',
        description: 'Sausalito\'s waterfront charm and hillside homes present unique challenges. We bring expertise to every delivery in this picturesque community.',
        highlights: ['Waterfront experience', 'Hillside navigation', 'Careful placement'],
        faqs: [
          { question: 'Can you deliver to Sausalito houseboats?', answer: 'We can deliver to accessible areas near the houseboats. Placement varies by location.' },
          { question: 'What about the hills above downtown?', answer: 'Yes, we navigate Sausalito\'s hills regularly.' },
        ],
      },
      {
        name: 'Tiburon',
        slug: 'tiburon',
        description: 'Tiburon\'s exclusive peninsula location requires a provider who understands upscale expectations. We deliver professional, discreet dumpster service.',
        highlights: ['Upscale peninsula service', 'Discreet placement', 'Professional standards'],
        faqs: [
          { question: 'Do you serve Belvedere?', answer: 'Yes, both Tiburon and Belvedere Island are in our service area.' },
          { question: 'What about waterfront properties?', answer: 'We serve waterfront homes with appropriate placement considerations.' },
        ],
      },
    ],
  },
  {
    name: 'Napa County',
    slug: 'napa',
    cities: [
      {
        name: 'Napa',
        slug: 'napa',
        description: 'The city of Napa blends wine country charm with residential and commercial activity. We serve downtown renovation, winery projects, and home cleanouts.',
        highlights: ['Wine country specialists', 'Downtown capable', 'Winery experience'],
        faqs: [
          { question: 'Do you work with Napa wineries?', answer: 'Yes, we serve many wineries for construction, renovation, and event cleanup.' },
          { question: 'What about downtown Napa?', answer: 'Downtown Napa is fully covered. We coordinate timing for busy areas.' },
        ],
      },
      {
        name: 'American Canyon',
        slug: 'american-canyon',
        description: 'American Canyon\'s growing residential areas and commercial development make it an active market. Fast delivery from our central location.',
        highlights: ['Growing area coverage', 'Fast response', 'New development specialists'],
        faqs: [
          { question: 'Is American Canyon a quick delivery?', answer: 'Yes, American Canyon gets quick response from our fleet.' },
          { question: 'Do you serve new housing developments?', answer: 'Yes, we work with builders throughout American Canyon.' },
        ],
      },
      {
        name: 'St. Helena',
        slug: 'st-helena',
        description: 'St. Helena\'s charming Main Street and surrounding wine estates require careful, professional service. We deliver with the discretion this community expects.',
        highlights: ['Wine estate experience', 'Charming downtown care', 'Discreet service'],
        faqs: [
          { question: 'How do you handle wine estate access?', answer: 'We coordinate with property managers for appropriate access and placement.' },
          { question: 'Is there extra charge for up-valley?', answer: 'St. Helena is standard pricing within our Napa County coverage.' },
        ],
      },
      {
        name: 'Calistoga',
        slug: 'calistoga',
        description: 'Calistoga\'s resort town character and surrounding properties need dumpster service that fits the setting. We provide professional delivery to this scenic destination.',
        highlights: ['Resort town experience', 'Scenic area care', 'Professional delivery'],
        faqs: [
          { question: 'Do you deliver to Calistoga resorts?', answer: 'Yes, we work with resorts and hospitality properties on renovation and construction.' },
          { question: 'What about remote vineyard properties?', answer: 'We can assess access for rural properties throughout Calistoga area.' },
        ],
      },
    ],
  },
  {
    name: 'Solano County',
    slug: 'solano',
    cities: [
      {
        name: 'Vallejo',
        slug: 'vallejo',
        description: 'Vallejo\'s waterfront revitalization and diverse neighborhoods create active demand. We serve residential, commercial, and marine-related projects.',
        highlights: ['Waterfront coverage', 'Mare Island experience', 'Diverse projects'],
        faqs: [
          { question: 'Do you serve Mare Island?', answer: 'Yes, Mare Island and all Vallejo waterfront areas are covered.' },
          { question: 'What about ferry-adjacent areas?', answer: 'Downtown and ferry-adjacent areas are fully served.' },
        ],
      },
      {
        name: 'Fairfield',
        slug: 'fairfield',
        description: 'Fairfield\'s central Solano location and diverse economy generate steady demand. From residential to commercial and industrial, we cover all needs.',
        highlights: ['Central Solano', 'All sector coverage', 'Reliable service'],
        faqs: [
          { question: 'How fast can you deliver to Fairfield?', answer: 'Same-day delivery is typically available for Fairfield.' },
          { question: 'Do you serve near Travis AFB?', answer: 'We cover areas near Travis Air Force Base.' },
        ],
      },
      {
        name: 'Vacaville',
        slug: 'vacaville',
        description: 'Vacaville\'s growing community and outlet center area keep us busy. We provide reliable dumpster service for this expanding I-80 corridor city.',
        highlights: ['I-80 corridor', 'Growing community', 'Reliable delivery'],
        faqs: [
          { question: 'Do you cover all Vacaville?', answer: 'Yes, from downtown to new developments, we cover all Vacaville.' },
          { question: 'Is there extra charge for Vacaville?', answer: 'Vacaville is standard pricing in our Solano County service area.' },
        ],
      },
      {
        name: 'Benicia',
        slug: 'benicia',
        description: 'Benicia\'s charming downtown, industrial waterfront, and residential areas all need dumpster service. We handle this waterfront community with care.',
        highlights: ['Historic downtown care', 'Industrial capability', 'Waterfront coverage'],
        faqs: [
          { question: 'Do you serve Benicia industrial areas?', answer: 'Yes, we deliver to industrial and commercial properties in Benicia.' },
          { question: 'What about historic downtown?', answer: 'We navigate historic downtown with appropriate care and timing.' },
        ],
      },
    ],
  },
  {
    name: 'Sonoma County',
    slug: 'sonoma',
    cities: [
      {
        name: 'Santa Rosa',
        slug: 'santa-rosa',
        description: 'As Sonoma County\'s largest city, Santa Rosa sees high demand for fire rebuild, renovation, and new construction dumpsters. We provide reliable service throughout.',
        highlights: ['Largest Sonoma city', 'Fire rebuild experience', 'Full city coverage'],
        faqs: [
          { question: 'Do you have fire rebuild experience?', answer: 'Yes, we\'ve supported many fire rebuild projects in Santa Rosa since 2017.' },
          { question: 'Do you cover all Santa Rosa?', answer: 'Yes, every neighborhood from Fountaingrove to Roseland.' },
        ],
      },
      {
        name: 'Petaluma',
        slug: 'petaluma',
        description: 'Petaluma\'s historic downtown and surrounding farms create diverse needs. From downtown renovation to agricultural cleanup, we\'re ready.',
        highlights: ['Historic downtown experience', 'Agricultural coverage', 'Diverse projects'],
        faqs: [
          { question: 'Do you deliver to Petaluma farms?', answer: 'Yes, we serve farms and rural properties throughout the Petaluma area.' },
          { question: 'What about downtown historic buildings?', answer: 'We handle historic building renovations with appropriate care.' },
        ],
      },
      {
        name: 'Rohnert Park',
        slug: 'rohnert-park',
        description: 'Rohnert Park\'s planned neighborhoods and SSU area generate steady residential demand. We provide reliable service to this growing community.',
        highlights: ['Planned community experience', 'SSU area coverage', 'Residential focus'],
        faqs: [
          { question: 'Do you serve near SSU?', answer: 'Yes, we cover all Rohnert Park including areas near Sonoma State.' },
          { question: 'What about the casino area?', answer: 'We serve commercial areas including near Graton Casino.' },
        ],
      },
      {
        name: 'Healdsburg',
        slug: 'healdsburg',
        description: 'Healdsburg\'s wine country character and upscale properties require refined service. We deliver with the professionalism this destination community expects.',
        highlights: ['Wine country service', 'Upscale property experience', 'Professional delivery'],
        faqs: [
          { question: 'Do you serve Healdsburg wineries?', answer: 'Yes, we work with many Healdsburg area wineries.' },
          { question: 'What about plaza area?', answer: 'Downtown and plaza area are covered with careful navigation.' },
        ],
      },
      {
        name: 'Sonoma',
        slug: 'sonoma-town',
        description: 'The town of Sonoma and surrounding wine country estates need dumpster service that fits the setting. We provide professional, discreet delivery.',
        highlights: ['Historic plaza experience', 'Wine estate coverage', 'Discreet service'],
        faqs: [
          { question: 'Do you serve Sonoma Valley estates?', answer: 'Yes, we cover estates throughout Sonoma Valley.' },
          { question: 'What about near the plaza?', answer: 'Historic plaza area is served with appropriate timing and care.' },
        ],
      },
    ],
  },
];

export const getCountyBySlug = (slug: string): CountyData | undefined => {
  return serviceAreas.find((county) => county.slug === slug);
};

export const getCityBySlug = (countySlug: string, citySlug: string): CityData | undefined => {
  const county = getCountyBySlug(countySlug);
  return county?.cities.find((city) => city.slug === citySlug);
};
