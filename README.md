# BM BLACK — Billetterie (prototype)

Prototype web en français pour tester la création de billets avec QR code et le contrôle à l'entrée.

## Tester
- Ouvrir `index.html` dans un navigateur récent (HTTPS recommandé pour l'accès caméra).
- Créer un billet, puis ouvrir **Mes billets** pour afficher le QR.
- Dans **Contrôler un billet**, scanner le QR ou saisir l'identifiant. Le billet passe à « déjà utilisé » après validation.

## Limites importantes
Cette version est une démonstration locale : les billets sont stockés dans le `localStorage` du navigateur. Les données ne sont pas partagées entre appareils, le contrôle n'est pas sécurisé contre la falsification et la caméra nécessite un contexte HTTPS/localhost. Ne pas l'utiliser pour vendre ou valider de vrais billets.

Pour une billetterie réelle, il faut connecter une base de données (par exemple Supabase), générer les billets côté serveur, et valider chaque identifiant atomiquement côté serveur afin qu'un billet ne puisse être accepté qu'une seule fois.
