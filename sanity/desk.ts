import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Weverskade')
    .items([
      // Pagina's groep
      S.listItem()
        .title("Pagina's")
        .child(
          S.list()
            .title("Pagina's")
            .items([
              S.listItem()
                .title('Home')
                .child(S.document().schemaType('homePage').documentId('homePage')),
              S.listItem()
                .title('Over Ons')
                .child(S.document().schemaType('overOnsPage').documentId('overOnsPage')),
              S.listItem()
                .title('Portefeuille')
                .child(S.document().schemaType('portefeuillePage').documentId('portefeuillePage')),
              S.listItem()
                .title('Wonen Bij')
                .child(S.document().schemaType('wonenBijPage').documentId('wonenBijPage')),
              S.listItem()
                .title('Maatschappelijk')
                .child(S.document().schemaType('maatschappelijkPage').documentId('maatschappelijkPage')),
              S.listItem()
                .title('Nieuws')
                .child(S.document().schemaType('nieuwsPageSettings').documentId('nieuwsPageSettings')),
              S.listItem()
                .title('Werken Bij')
                .child(S.document().schemaType('werkenBijPage').documentId('werkenBijPage')),
              S.listItem()
                .title('Contact')
                .child(S.document().schemaType('contactPage').documentId('contactPage')),
            ])
        ),
      S.divider(),
      // Content types met drag-and-drop volgorde
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projecten',
        S,
        context,
      }),
      S.listItem()
        .title('Nieuwsberichten')
        .schemaType('nieuwsArtikel')
        .child(S.documentTypeList('nieuwsArtikel').title('Nieuwsberichten')),
      S.listItem()
        .title('Vacatures')
        .schemaType('vacature')
        .child(S.documentTypeList('vacature').title('Vacatures')),
      S.listItem()
        .title('Formulier inzendingen')
        .schemaType('formSubmission')
        .child(
          S.documentTypeList('formSubmission')
            .title('Formulier inzendingen')
            .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
        ),
      orderableDocumentListDeskItem({
        type: 'teamLid',
        title: 'Team',
        S,
        context,
      }),
      S.divider(),
      // Instellingen
      S.listItem()
        .title('Instellingen')
        .child(
          S.list()
            .title('Instellingen')
            .items([
              S.listItem()
                .title('Algemeen')
                .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
              S.listItem()
                .title('Footer')
                .child(S.document().schemaType('footer').documentId('footer')),
            ])
        ),
    ])
