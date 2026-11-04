<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { legal } from '../lib/legal';
import { setSeo } from '../lib/seo';

type LegalPage = 'legal' | 'privacy' | 'cookies' | 'terms';

const route = useRoute();
const page = computed(() => String(route.meta.legalPage ?? 'legal') as LegalPage);
const title = computed(
  () =>
    ({
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      cookies: 'Cookies et traceurs',
      terms: 'Conditions générales d’utilisation',
    })[page.value],
);

watchEffect(() => {
  setSeo({
    title: `${title.value} | Élégance`,
    description: `${title.value} du site Élégance.`,
    canonical: `${window.location.origin}${route.path}`,
  });
});
</script>

<template>
  <main class="mx-auto max-w-4xl px-6 py-14 md:py-20">
    <p class="eyebrow">Informations légales</p>
    <h1 class="mt-3 text-4xl font-light md:text-5xl">{{ title }}</h1>
    <p class="mt-4 text-sm text-stone-500">Dernière mise à jour : {{ legal.updatedAt }}</p>

    <div v-if="page === 'legal'" class="legal-copy">
      <h2>Éditeur du site</h2>
      <p>
        Éditeur : <strong>{{ legal.publisherName }}</strong
        ><br />
        {{ legal.publisherForm }}<br />
        Adresse : {{ legal.publisherAddress }}<br />
        E-mail : {{ legal.publisherEmail }}<br />
        Immatriculation : {{ legal.registration }}
      </p>
      <h2>Hébergement</h2>
      <p>Hébergeur : {{ legal.hostName }}<br />{{ legal.hostAddress }}</p>
      <h2>Responsabilité</h2>
      <p>
        Les informations publiées doivent être vérifiées par l’éditeur. Les annonces sont publiées
        sous la responsabilité de leurs auteurs et peuvent faire l’objet de contrôles et de
        modération.
      </p>
      <p class="legal-warning">
        Les valeurs entre crochets sont des valeurs de repli. Configurez les variables VITE_LEGAL_*
        dans Vercel avant la mise en production publique.
      </p>
    </div>

    <div v-else-if="page === 'privacy'" class="legal-copy">
      <h2>Responsable du traitement</h2>
      <p>
        Responsable : <strong>{{ legal.publisherName }}</strong
        >, {{ legal.publisherAddress }}. Contact RGPD : <strong>{{ legal.privacyEmail }}</strong
        >. Cette page décrit les traitements réalisés par le site et son API ; elle doit être
        alignée avec les traitements réellement activés côté serveur.
      </p>
      <h2>Données et finalités</h2>
      <p>
        Selon les fonctionnalités utilisées, l’API peut traiter une adresse e-mail, un nom ou
        pseudonyme, des informations de compte, des annonces, des coordonnées publiées par un
        annonceur, des commentaires et les données nécessaires à la sécurité et à la gestion des
        abonnements. Ces données servent à créer et sécuriser un compte, publier et modérer des
        annonces, fournir les fonctionnalités demandées et répondre aux obligations légales.
      </p>
      <h2>Bases, destinataires et durées</h2>
      <p>
        Chaque finalité doit être rattachée à sa base légale et à une durée de conservation dans le
        registre du responsable du traitement. Les prestataires techniques et de paiement peuvent
        recevoir les seules données nécessaires à leur mission, conformément à leurs contrats.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la
        portabilité de vos données, et vous opposer à certains traitements. Contact :
        <strong>{{ legal.privacyEmail }}</strong
        >. Vous pouvez également adresser une réclamation à la CNIL.
      </p>
      <h2>Sécurité et transferts</h2>
      <p>
        Des mesures techniques et organisationnelles doivent protéger les comptes et les contenus.
        Tout transfert hors de l’Espace économique européen doit être documenté avec le mécanisme
        juridique applicable avant activation du prestataire concerné.
      </p>
      <p class="legal-warning">
        Cette page est une base d’information frontend : les bases légales, durées, sous-traitants
        et coordonnées doivent être alignés avec l’API Laravel et les contrats réellement utilisés.
      </p>
    </div>

    <div v-else-if="page === 'cookies'" class="legal-copy">
      <h2>État actuel</h2>
      <p>
        Le frontend n’active actuellement aucun cookie publicitaire, de profilage ou de mesure
        d’audience. La confirmation d’âge est mémorisée dans le stockage local du navigateur pour
        éviter de réafficher la fenêtre à chaque visite ; elle ne contient ni nom, ni e-mail, ni
        identifiant publicitaire.
      </p>
      <h2>Cookies strictement nécessaires</h2>
      <p>
        L’API peut utiliser des mécanismes strictement nécessaires à l’authentification, à la
        sécurité ou à la fourniture d’une fonctionnalité demandée. Leur liste, leur finalité, leur
        durée et leur fournisseur doivent être complétés ici dès qu’ils sont activés.
      </p>
      <h2>Pas de traceur non nécessaire sans consentement</h2>
      <p>
        Aucun outil d’analyse, pixel publicitaire, outil de retargeting ou contenu tiers traçant ne
        doit être ajouté sans information préalable et consentement lorsque celui-ci est requis. Le
        retrait d’un consentement doit être aussi simple que son acceptation.
      </p>
      <h2>Gérer son navigateur</h2>
      <p>
        Vous pouvez supprimer le stockage local et les cookies dans les réglages de votre
        navigateur. Cela peut réafficher la confirmation d’âge ou désactiver une fonctionnalité
        nécessaire.
      </p>
    </div>

    <div v-else class="legal-copy">
      <h2>Accès au service</h2>
      <p>
        Le service est réservé aux personnes majeures. L’utilisateur s’engage à fournir des
        informations exactes, à respecter la loi et les droits des tiers, et à ne pas utiliser le
        service pour solliciter ou publier un contenu illicite.
      </p>
      <h2>Comptes et annonces</h2>
      <p>
        Les utilisateurs restent responsables de leurs identifiants et des contenus qu’ils publient.
        L’éditeur peut suspendre ou retirer un contenu qui viole la loi, ces conditions ou les
        règles de sécurité du service.
      </p>
      <h2>Contact et signalement</h2>
      <p>
        Les modalités de signalement, de modération, de résiliation et de contact doivent être
        complétées avec les coordonnées et les règles opérationnelles de l’API avant production.
      </p>
      <p class="legal-warning">
        Ces conditions sont une base produit et ne remplacent pas une validation juridique adaptée
        au statut de l’éditeur et aux services effectivement proposés.
      </p>
    </div>
  </main>
</template>
