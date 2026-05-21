import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

const Page = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Conditions générales d’utilisation – Toklo</Text>
      <Text style={styles.subtitle}>Dernière mise à jour : [à compléter]</Text>
      <Text style={styles.sectionTitle}>1. Objet / Purpose</Text>
      <Text style={styles.text}>
        FR : Les présentes Conditions Générales d’Utilisation ont pour objet de définir les modalités d’accès et d’utilisation de l’application Toklo par les utilisateurs, notamment les professionnels de la confection.{"\n"}
        EN : These Terms of Use define the conditions of access and use of the Toklo application by users, especially tailoring professionals.
      </Text>

      <Text style={styles.sectionTitle}>2. Présentation de l’application / App Description</Text>
      <Text style={styles.text}>
        FR : Toklo est une application mobile destinée aux professionnels de la couture pour :{"\n"}
        - Enregistrer les commandes clients{"\n"}
        - Planifier les rendez-vous de prise de mesures{"\n"}
        - Gérer un catalogue de modèles{"\n"}
        - Vendre leurs créations via une boutique en ligne{"\n"}
        - Recevoir des rappels de rendez-vous{"\n"}
        - Suivre les performances grâce à des statistiques claires{"\n\n"}
        EN : Toklo is a mobile app designed for tailoring professionals to:{"\n"}
        - Record customer orders{"\n"}
        - Schedule fitting appointments{"\n"}
        - Manage a clothing design catalog{"\n"}
        - Sell creations through an online store{"\n"}
        - Receive appointment reminders{"\n"}
        - Track business performance with clear statistics
      </Text>

      <Text style={styles.sectionTitle}>3. Accès à l'application / Access</Text>
      <Text style={styles.text}>
        FR : Toklo est accessible à toute personne physique ou morale exerçant une activité dans la confection de vêtements. L’utilisateur peut être amené à créer un compte.{"\n"}
        EN : Toklo is available to any individual or entity involved in tailoring. A user account may be required.
      </Text>

      <Text style={styles.sectionTitle}>4. Données personnelles / Personal Data</Text>
      <Text style={styles.text}>
        FR : Toklo collecte les données suivantes : nom, numéro de téléphone, géolocalisation de l’atelier. Elles servent exclusivement à la planification, aux rappels, et à l’affichage de la boutique.{"\n"}
        EN : Toklo collects the following data: name, phone number, and workshop location. These are used exclusively for scheduling, reminders, and displaying your shop.
      </Text>

      <Text style={styles.sectionTitle}>5. Propriété intellectuelle / Intellectual Property</Text>
      <Text style={styles.text}>
        FR : Tous les contenus, logos et éléments graphiques sont la propriété de Coumbassa & Sanden Tech ou de leurs auteurs respectifs.{"\n"}
        EN : All content, logos and graphics are the property of Coumbassa & Sanden Tech or their respective authors.
      </Text>

      <Text style={styles.sectionTitle}>6. Responsabilités / Liability</Text>
      <Text style={styles.text}>
        FR : Coumbassa & Sanden Tech décline toute responsabilité en cas de perte de données, conflits ou interruptions dus à une mauvaise utilisation.{"\n"}
        EN : Coumbassa & Sanden Tech is not liable for any data loss, conflicts, or downtime resulting from misuse.
      </Text>

      <Text style={styles.sectionTitle}>7. Modifications / Updates</Text>
      <Text style={styles.text}>
        FR : Les CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés.{"\n"}
        EN : These Terms may be updated at any time. Users will be notified of any changes.
      </Text>

      <Text style={styles.sectionTitle}>8. Contact</Text>
      <Text style={styles.text}>
        FR : Pour toute question, contactez-nous via le formulaire dans l’application.{"\n"}
        EN : For questions, contact us through the app's contact form.
      </Text>
    </ScrollView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
});
