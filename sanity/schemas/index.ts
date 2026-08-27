// Objects
import { portableText } from './objects/portableText'
import { sectionCta } from './objects/sectionCta'
import { stat } from './objects/stat'
import { polygonPoint } from './objects/polygonPoint'
import { woning } from './objects/woning'
import { woningType } from './objects/woningType'

// Documents
import { project } from './documents/project'
import { nieuwsArtikel } from './documents/nieuwsArtikel'
import { vacature } from './documents/vacature'
import { teamLid } from './documents/teamLid'
import { formSubmission } from './documents/formSubmission'

// Singletons
import { siteSettings } from './singletons/siteSettings'
import { footer } from './singletons/footer'
import { homePage } from './singletons/homePage'
import { overOnsPage } from './singletons/overOnsPage'
import { maatschappelijkPage } from './singletons/maatschappelijkPage'
import { contactPage } from './singletons/contactPage'
import { portefeuillePage } from './singletons/portefeuillePage'
import { wonenBijPage } from './singletons/wonenBijPage'
import { nieuwsPageSettings } from './singletons/nieuwsPageSettings'
import { werkenBijPage } from './singletons/werkenBijPage'

export const schemaTypes = [
  // Objects
  portableText,
  sectionCta,
  stat,
  polygonPoint,
  woning,
  woningType,
  // Documents
  project,
  nieuwsArtikel,
  vacature,
  teamLid,
  formSubmission,
  // Singletons
  siteSettings,
  footer,
  homePage,
  overOnsPage,
  maatschappelijkPage,
  contactPage,
  portefeuillePage,
  wonenBijPage,
  nieuwsPageSettings,
  werkenBijPage,
]

export const singletonTypes = new Set([
  'siteSettings',
  'footer',
  'homePage',
  'overOnsPage',
  'maatschappelijkPage',
  'contactPage',
  'portefeuillePage',
  'wonenBijPage',
  'nieuwsPageSettings',
  'werkenBijPage',
])
