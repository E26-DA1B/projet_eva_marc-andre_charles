import { createRouter, createWebHashHistory } from "vue-router";
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: () => import("../views/TableauBord.vue") },
    { path: "/carte", component: () => import("../views/CarteArbres.vue") },
    { path: "/arbres", component: () => import("../views/ListeArbres.vue") },
    { path: "/favoris", component: () => import("../views/FavorisArbres.vue") },
    {
      path: "/ajouter",
      component: () => import("../views/FormulaireArbre.vue"),
    },
    {
      path: "/arbres/:id/modifier",
      component: () => import("../views/FormulaireArbre.vue"),
      props: true,
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
