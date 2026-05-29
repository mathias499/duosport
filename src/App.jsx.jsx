import { useState, useMemo, useEffect, useRef } from "react";
import { supabase } from './supabase.js';

// ═══════════════════════════════════════════════════════════
// PALETTE
// ═══════════════════════════════════════════════════════════
const P = {
  sky:"#38C9F0", sun:"#FFD93D", grass:"#3DDC84", coral:"#FF6B6B",
  purple:"#A78BFA", orange:"#FF9F43", pink:"#FF6EB4",
  navy:"#1A1F3C", navyL:"#242947", navyLL:"#2E3460",
  white:"#FFFFFF", offW:"#F0F4FF", gray:"#8892B0",
};

// ═══════════════════════════════════════════════════════════
// BASE DE REPAS — 300 repas midi + soir
// ═══════════════════════════════════════════════════════════
const REPAS_DB = [
  // ── POULET ─────────────────────────────────────────────
  {id:1,  nom:"Poulet rôti aux herbes",        proteines:["poulet"],   feculents:["pommes"],   legumes:["carotte"],     moment:["soir"],  tps:30, cal:480, p:42,g:35,l:14, objectifs:["poids","condition"], contraintes:[]},
  {id:2,  nom:"Bowl poulet riz légumes",        proteines:["poulet"],   feculents:["riz"],      legumes:["courgette","poivron"], moment:["midi","soir"], tps:20, cal:520, p:45,g:48,l:10, objectifs:["condition","renforcement"], contraintes:[]},
  {id:3,  nom:"Poulet sauté aux poivrons",      proteines:["poulet"],   feculents:["riz"],      legumes:["poivron"],     moment:["soir"],  tps:20, cal:490, p:40,g:45,l:11, objectifs:["poids","maintenance"], contraintes:[]},
  {id:4,  nom:"Escalope de poulet & quinoa",    proteines:["poulet"],   feculents:["quinoa"],   legumes:["epinards"],    moment:["soir"],  tps:25, cal:460, p:44,g:38,l:10, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},
  {id:5,  nom:"Wok poulet brocoli",             proteines:["poulet"],   feculents:["riz"],      legumes:["brocoli"],     moment:["midi","soir"], tps:15, cal:470, p:43,g:42,l:9,  objectifs:["poids","condition"], contraintes:[]},
  {id:6,  nom:"Poulet mariné citron & ail",     proteines:["poulet"],   feculents:["patate_douce"], legumes:["salade"],  moment:["soir"],  tps:30, cal:500, p:44,g:40,l:12, objectifs:["condition","renforcement"], contraintes:["sans_gluten"]},
  {id:7,  nom:"Blanc de poulet & haricots verts",proteines:["poulet"],  feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:25, cal:430, p:40,g:32,l:10, objectifs:["poids"],              contraintes:["sans_gluten"]},
  {id:8,  nom:"Poulet basquaise",               proteines:["poulet"],   feculents:["riz"],      legumes:["poivron","tomate"], moment:["soir"], tps:35, cal:510, p:42,g:46,l:12, objectifs:["maintenance","condition"], contraintes:[]},
  {id:9,  nom:"Salade César poulet grillé",     proteines:["poulet"],   feculents:["pain"],     legumes:["salade"],     moment:["midi"],  tps:15, cal:420, p:38,g:28,l:14, objectifs:["poids","maintenance"], contraintes:[]},
  {id:10, nom:"Poulet curry coco & riz",        proteines:["poulet"],   feculents:["riz"],      legumes:["courgette"],  moment:["soir"],  tps:25, cal:540, p:40,g:50,l:16, objectifs:["renforcement","maintenance"], contraintes:["sans_gluten"]},
  {id:11, nom:"Poulet grillé & lentilles",      proteines:["poulet"],   feculents:["lentilles"],legumes:["carotte","epinards"], moment:["soir"], tps:30, cal:490, p:46,g:40,l:10, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},
  {id:12, nom:"Tacos poulet avocat",            proteines:["poulet"],   feculents:["pain"],     legumes:["tomate","salade"], moment:["midi"], tps:15, cal:510, p:38,g:42,l:18, objectifs:["renforcement","maintenance"], contraintes:[]},
  {id:13, nom:"Poulet façon teriyaki",          proteines:["poulet"],   feculents:["riz"],      legumes:["brocoli","champignon"], moment:["soir"], tps:20, cal:500, p:41,g:48,l:11, objectifs:["condition","maintenance"], contraintes:[]},
  {id:14, nom:"Poulet rôti patates douces",     proteines:["poulet"],   feculents:["patate_douce"], legumes:["haricots"], moment:["soir"], tps:40, cal:530, p:43,g:44,l:13, objectifs:["renforcement","condition"], contraintes:["sans_gluten"]},
  {id:15, nom:"Salade poulet quinoa",           proteines:["poulet"],   feculents:["quinoa"],   legumes:["tomate","salade"], moment:["midi"], tps:15, cal:440, p:40,g:36,l:11, objectifs:["poids"],             contraintes:["sans_gluten"]},

  // ── BŒUF ───────────────────────────────────────────────
  {id:20, nom:"Steak haché & pommes vapeur",    proteines:["boeuf"],    feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:20, cal:520, p:44,g:36,l:18, objectifs:["renforcement"],       contraintes:["sans_gluten"]},
  {id:21, nom:"Bœuf sauté aux légumes",         proteines:["boeuf"],    feculents:["riz"],      legumes:["poivron","champignon"], moment:["soir"], tps:20, cal:510, p:42,g:44,l:15, objectifs:["renforcement","condition"], contraintes:[]},
  {id:22, nom:"Bolognaise maison",              proteines:["boeuf"],    feculents:["pates"],    legumes:["tomate","carotte"], moment:["soir"], tps:35, cal:580, p:38,g:60,l:16, objectifs:["renforcement","maintenance"], contraintes:[]},
  {id:23, nom:"Burger maison healthy",          proteines:["boeuf"],    feculents:["pain"],     legumes:["salade","tomate"], moment:["midi"], tps:20, cal:560, p:40,g:48,l:20, objectifs:["renforcement","maintenance"], contraintes:[]},
  {id:24, nom:"Steak & couscous épicé",         proteines:["boeuf"],    feculents:["couscous"], legumes:["courgette","carotte"], moment:["soir"], tps:25, cal:540, p:42,g:50,l:15, objectifs:["renforcement","condition"], contraintes:[]},
  {id:25, nom:"Bœuf & lentilles mijotées",      proteines:["boeuf"],    feculents:["lentilles"],legumes:["carotte","tomate"], moment:["soir"], tps:40, cal:530, p:46,g:42,l:14, objectifs:["renforcement","poids"], contraintes:["sans_gluten"]},
  {id:26, nom:"Tartare de bœuf & frites four",  proteines:["boeuf"],    feculents:["pommes"],   legumes:["salade"],     moment:["midi"],  tps:20, cal:500, p:38,g:38,l:20, objectifs:["maintenance"],        contraintes:["sans_gluten"]},
  {id:27, nom:"Émincé de bœuf & riz cantonnais",proteines:["boeuf"],    feculents:["riz"],      legumes:["poivron","champignon"], moment:["soir"], tps:25, cal:520, p:40,g:48,l:14, objectifs:["condition","maintenance"], contraintes:[]},
  {id:28, nom:"Chili con carne",                proteines:["boeuf"],    feculents:["riz"],      legumes:["poivron","tomate"], moment:["soir"], tps:35, cal:550, p:42,g:50,l:16, objectifs:["renforcement","maintenance"], contraintes:["sans_gluten"]},
  {id:29, nom:"Steak quinoa & épinards",        proteines:["boeuf"],    feculents:["quinoa"],   legumes:["epinards"],   moment:["soir"],  tps:20, cal:490, p:44,g:38,l:16, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},

  // ── POISSON ────────────────────────────────────────────
  {id:40, nom:"Saumon grillé & riz",            proteines:["poisson"],  feculents:["riz"],      legumes:["brocoli"],    moment:["soir"],  tps:20, cal:490, p:40,g:44,l:16, objectifs:["poids","condition"],  contraintes:["sans_gluten"]},
  {id:41, nom:"Dos de cabillaud citronné",       proteines:["poisson"],  feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:20, cal:400, p:38,g:32,l:10, objectifs:["poids"],              contraintes:["sans_gluten"]},
  {id:42, nom:"Pavé de saumon & quinoa",         proteines:["poisson"],  feculents:["quinoa"],   legumes:["epinards","tomate"], moment:["soir"], tps:25, cal:470, p:42,g:38,l:15, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},
  {id:43, nom:"Poisson pané four & patate douce",proteines:["poisson"],  feculents:["patate_douce"],legumes:["salade"],  moment:["midi","soir"], tps:25, cal:480, p:36,g:44,l:12, objectifs:["maintenance","condition"], contraintes:[]},
  {id:44, nom:"Truite amandine & haricots",      proteines:["poisson"],  feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:20, cal:430, p:38,g:30,l:16, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:45, nom:"Wok saumon légumes",              proteines:["poisson"],  feculents:["riz"],      legumes:["poivron","courgette"], moment:["midi","soir"], tps:15, cal:460, p:38,g:42,l:14, objectifs:["poids","condition"], contraintes:["sans_gluten"]},
  {id:46, nom:"Cabillaud à la provençale",       proteines:["poisson"],  feculents:["couscous"], legumes:["tomate","courgette"], moment:["soir"], tps:25, cal:420, p:36,g:38,l:10, objectifs:["poids","maintenance"], contraintes:[]},
  {id:47, nom:"Bowl saumon avocat riz",          proteines:["poisson"],  feculents:["riz"],      legumes:["salade","tomate"], moment:["midi"], tps:15, cal:510, p:38,g:48,l:18, objectifs:["maintenance","renforcement"], contraintes:["sans_gluten"]},
  {id:48, nom:"Filet de bar & lentilles",        proteines:["poisson"],  feculents:["lentilles"],legumes:["epinards"],   moment:["soir"],  tps:25, cal:430, p:40,g:36,l:11, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},
  {id:49, nom:"Maquereau four & pommes vapeur",  proteines:["poisson"],  feculents:["pommes"],   legumes:["carotte"],    moment:["soir"],  tps:20, cal:440, p:36,g:34,l:16, objectifs:["condition","poids"],  contraintes:["sans_gluten"]},

  // ── THON ───────────────────────────────────────────────
  {id:60, nom:"Salade niçoise",                  proteines:["thon"],     feculents:["pommes"],   legumes:["tomate","haricots","salade"], moment:["midi"], tps:15, cal:420, p:34,g:30,l:14, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:61, nom:"Pâtes thon tomate",               proteines:["thon"],     feculents:["pates"],    legumes:["tomate"],     moment:["midi","soir"], tps:15, cal:490, p:36,g:58,l:10, objectifs:["condition","renforcement"], contraintes:[]},
  {id:62, nom:"Riz thon poivrons",               proteines:["thon"],     feculents:["riz"],      legumes:["poivron","tomate"], moment:["midi"], tps:10, cal:430, p:34,g:44,l:9,  objectifs:["poids","condition"],  contraintes:["sans_gluten"]},
  {id:63, nom:"Wrap thon crudités",              proteines:["thon"],     feculents:["pain"],     legumes:["salade","tomate"], moment:["midi"], tps:10, cal:400, p:32,g:38,l:11, objectifs:["poids"],              contraintes:[]},
  {id:64, nom:"Bowl thon quinoa légumes",        proteines:["thon"],     feculents:["quinoa"],   legumes:["courgette","tomate"], moment:["midi","soir"], tps:15, cal:440, p:36,g:40,l:10, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:65, nom:"Gratin thon courgettes",          proteines:["thon"],     feculents:["pates"],    legumes:["courgette"],  moment:["soir"],  tps:30, cal:480, p:34,g:50,l:14, objectifs:["maintenance","renforcement"], contraintes:[]},

  // ── ŒUFS ───────────────────────────────────────────────
  {id:70, nom:"Omelette aux champignons",        proteines:["oeufs"],    feculents:["pain"],     legumes:["champignon"], moment:["midi","soir"], tps:10, cal:380, p:28,g:24,l:20, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:71, nom:"Frittata épinards & pommes",      proteines:["oeufs"],    feculents:["pommes"],   legumes:["epinards"],   moment:["soir"],  tps:25, cal:400, p:28,g:32,l:18, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:72, nom:"Shakshuka maison",                proteines:["oeufs"],    feculents:["pain"],     legumes:["tomate","poivron"], moment:["midi","soir"], tps:20, cal:380, p:24,g:32,l:16, objectifs:["maintenance","poids"], contraintes:[]},
  {id:73, nom:"Œufs brouillés & légumes sautés", proteines:["oeufs"],    feculents:["pain"],     legumes:["champignon","epinards"], moment:["midi"], tps:10, cal:350, p:24,g:22,l:18, objectifs:["poids"],           contraintes:[]},
  {id:74, nom:"Quiche sans pâte épinards",       proteines:["oeufs"],    feculents:["pommes"],   legumes:["epinards"],   moment:["soir"],  tps:35, cal:360, p:26,g:20,l:18, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:75, nom:"Riz cantonais œufs & légumes",    proteines:["oeufs"],    feculents:["riz"],      legumes:["carotte","poivron"], moment:["midi","soir"], tps:15, cal:430, p:22,g:48,l:14, objectifs:["maintenance","renforcement"], contraintes:["sans_gluten"]},
  {id:76, nom:"Tortilla espagnole",              proteines:["oeufs"],    feculents:["pommes"],   legumes:["poivron"],    moment:["midi","soir"], tps:25, cal:410, p:24,g:36,l:18, objectifs:["maintenance"],        contraintes:["sans_gluten"]},
  {id:77, nom:"Salade œufs durs & quinoa",       proteines:["oeufs"],    feculents:["quinoa"],   legumes:["tomate","salade"], moment:["midi"], tps:15, cal:390, p:26,g:34,l:14, objectifs:["poids"],             contraintes:["sans_gluten"]},

  // ── CREVETTES ──────────────────────────────────────────
  {id:80, nom:"Crevettes sautées & riz thaï",    proteines:["crevettes"],feculents:["riz"],      legumes:["poivron","courgette"], moment:["soir"], tps:15, cal:450, p:36,g:48,l:10, objectifs:["poids","condition"], contraintes:["sans_gluten"]},
  {id:81, nom:"Wok crevettes brocoli",           proteines:["crevettes"],feculents:["riz"],      legumes:["brocoli"],    moment:["midi","soir"], tps:15, cal:420, p:34,g:44,l:9,  objectifs:["poids"],              contraintes:["sans_gluten"]},
  {id:82, nom:"Crevettes à l'ail & pâtes",       proteines:["crevettes"],feculents:["pates"],    legumes:["tomate"],     moment:["soir"],  tps:15, cal:480, p:32,g:56,l:12, objectifs:["condition","renforcement"], contraintes:[]},
  {id:83, nom:"Salade crevettes avocat quinoa",  proteines:["crevettes"],feculents:["quinoa"],   legumes:["salade","tomate"], moment:["midi"], tps:15, cal:430, p:32,g:38,l:16, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:84, nom:"Crevettes curry & riz basmati",   proteines:["crevettes"],feculents:["riz"],      legumes:["epinards"],   moment:["soir"],  tps:20, cal:460, p:34,g:48,l:12, objectifs:["maintenance","condition"], contraintes:["sans_gluten"]},

  // ── JAMBON ─────────────────────────────────────────────
  {id:90, nom:"Croque monsieur four allégé",     proteines:["jambon"],   feculents:["pain"],     legumes:["salade"],     moment:["midi"],  tps:15, cal:420, p:28,g:38,l:16, objectifs:["maintenance"],        contraintes:[]},
  {id:91, nom:"Jambon & lentilles mijotées",     proteines:["jambon"],   feculents:["lentilles"],legumes:["carotte"],    moment:["soir"],  tps:30, cal:440, p:36,g:40,l:12, objectifs:["poids","renforcement"], contraintes:["sans_gluten"]},
  {id:92, nom:"Penne jambon poivrons",           proteines:["jambon"],   feculents:["pates"],    legumes:["poivron"],    moment:["midi","soir"], tps:15, cal:480, p:30,g:58,l:12, objectifs:["maintenance","condition"], contraintes:[]},
  {id:93, nom:"Riz jambon épinards",             proteines:["jambon"],   feculents:["riz"],      legumes:["epinards"],   moment:["midi"],  tps:15, cal:440, p:30,g:48,l:10, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:94, nom:"Gratin jambon courgettes",        proteines:["jambon"],   feculents:["pommes"],   legumes:["courgette"],  moment:["soir"],  tps:35, cal:460, p:32,g:36,l:16, objectifs:["maintenance"],        contraintes:["sans_gluten"]},

  // ── TOFU / VÉGÉ ────────────────────────────────────────
  {id:100,nom:"Tofu sauté riz légumes",          proteines:["tofu"],     feculents:["riz"],      legumes:["poivron","brocoli"], moment:["soir"], tps:20, cal:420, p:22,g:50,l:12, objectifs:["poids","maintenance"], contraintes:["sans_gluten","vegetarien"]},
  {id:101,nom:"Bowl tofu quinoa épinards",       proteines:["tofu"],     feculents:["quinoa"],   legumes:["epinards","tomate"], moment:["midi","soir"], tps:20, cal:400, p:24,g:40,l:12, objectifs:["poids"],          contraintes:["sans_gluten","vegetarien"]},
  {id:102,nom:"Curry tofu courgette",            proteines:["tofu"],     feculents:["riz"],      legumes:["courgette"],  moment:["soir"],  tps:25, cal:430, p:22,g:48,l:14, objectifs:["maintenance"],        contraintes:["sans_gluten","vegetarien"]},
  {id:103,nom:"Lentilles corail & épinards",     proteines:["tofu"],     feculents:["lentilles"],legumes:["epinards","carotte"], moment:["soir"], tps:30, cal:410, p:24,g:44,l:10, objectifs:["poids","maintenance"], contraintes:["sans_gluten","vegetarien"]},
  {id:104,nom:"Pâtes aux légumes & fromage",     proteines:["oeufs"],    feculents:["pates"],    legumes:["courgette","tomate"], moment:["soir"], tps:20, cal:460, p:22,g:58,l:14, objectifs:["maintenance"],       contraintes:["vegetarien"]},
  {id:105,nom:"Galettes de lentilles four",      proteines:["tofu"],     feculents:["lentilles"],legumes:["carotte","champignon"], moment:["soir"], tps:35, cal:390, p:22,g:42,l:10, objectifs:["poids","maintenance"], contraintes:["vegetarien","sans_gluten"]},

  // ── PÂTES (mixtes) ─────────────────────────────────────
  {id:110,nom:"Spaghetti poulet basilic",        proteines:["poulet"],   feculents:["pates"],    legumes:["tomate"],     moment:["soir"],  tps:25, cal:540, p:40,g:60,l:12, objectifs:["renforcement","condition"], contraintes:[]},
  {id:111,nom:"Pennes poulet épinards",          proteines:["poulet"],   feculents:["pates"],    legumes:["epinards"],   moment:["midi","soir"], tps:20, cal:510, p:38,g:56,l:12, objectifs:["condition","maintenance"], contraintes:[]},
  {id:112,nom:"Linguines saumon épinards",       proteines:["poisson"],  feculents:["pates"],    legumes:["epinards"],   moment:["soir"],  tps:20, cal:520, p:36,g:58,l:14, objectifs:["renforcement","maintenance"], contraintes:[]},
  {id:113,nom:"Rigatoni bœuf bolognaise allégée",proteines:["boeuf"],    feculents:["pates"],    legumes:["tomate","carotte"], moment:["soir"], tps:30, cal:550, p:38,g:62,l:14, objectifs:["renforcement"],        contraintes:[]},

  // ── COUSCOUS / QUINOA spéciaux ─────────────────────────
  {id:120,nom:"Couscous poulet légumes",         proteines:["poulet"],   feculents:["couscous"], legumes:["courgette","carotte","tomate"], moment:["soir"], tps:30, cal:530, p:42,g:52,l:12, objectifs:["maintenance","condition"], contraintes:[]},
  {id:121,nom:"Couscous bœuf merguez",           proteines:["boeuf"],    feculents:["couscous"], legumes:["carotte","courgette"], moment:["soir"], tps:35, cal:570, p:40,g:54,l:18, objectifs:["renforcement","maintenance"], contraintes:[]},
  {id:122,nom:"Quinoa poulet légumes grillés",   proteines:["poulet"],   feculents:["quinoa"],   legumes:["poivron","courgette"], moment:["midi","soir"], tps:25, cal:460, p:42,g:40,l:11, objectifs:["poids","condition"], contraintes:["sans_gluten"]},
  {id:123,nom:"Quinoa crevettes avocat",         proteines:["crevettes"],feculents:["quinoa"],   legumes:["salade","tomate"], moment:["midi"], tps:15, cal:430, p:32,g:40,l:14, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},

  // ── PATATE DOUCE spéciaux ──────────────────────────────
  {id:130,nom:"Patate douce farcie poulet",      proteines:["poulet"],   feculents:["patate_douce"],legumes:["epinards"], moment:["soir"],  tps:40, cal:490, p:40,g:46,l:11, objectifs:["renforcement","poids"],contraintes:["sans_gluten"]},
  {id:131,nom:"Patate douce saumon four",        proteines:["poisson"],  feculents:["patate_douce"],legumes:["haricots"], moment:["soir"],  tps:35, cal:470, p:38,g:44,l:13, objectifs:["poids","condition"],  contraintes:["sans_gluten"]},
  {id:132,nom:"Patate douce œufs épinards",      proteines:["oeufs"],    feculents:["patate_douce"],legumes:["epinards"], moment:["midi","soir"], tps:25, cal:400, p:24,g:42,l:14, objectifs:["poids","maintenance"], contraintes:["sans_gluten","vegetarien"]},

  // ── REPAS BUDGET ───────────────────────────────────────
  {id:140,nom:"Riz haricots œufs",              proteines:["oeufs"],    feculents:["riz"],      legumes:["haricots"],   moment:["midi","soir"], tps:15, cal:390, p:22,g:48,l:12, objectifs:["poids","maintenance"], contraintes:["budget","sans_gluten","vegetarien"]},
  {id:141,nom:"Lentilles carotte cumin",         proteines:["tofu"],     feculents:["lentilles"],legumes:["carotte"],    moment:["soir"],  tps:25, cal:370, p:20,g:44,l:8,  objectifs:["poids"],              contraintes:["budget","vegetarien","sans_gluten"]},
  {id:142,nom:"Pâtes thon tomates budget",       proteines:["thon"],     feculents:["pates"],    legumes:["tomate"],     moment:["midi","soir"], tps:15, cal:460, p:32,g:56,l:10, objectifs:["condition","maintenance"], contraintes:["budget"]},
  {id:143,nom:"Œufs cocotte aux légumes",        proteines:["oeufs"],    feculents:["pain"],     legumes:["champignon","epinards"], moment:["soir"], tps:20, cal:340, p:22,g:24,l:16, objectifs:["poids"],          contraintes:["budget","vegetarien"]},
  {id:144,nom:"Soupe poulet légumes riz",        proteines:["poulet"],   feculents:["riz"],      legumes:["carotte","poivron"], moment:["soir"], tps:30, cal:380, p:34,g:38,l:8,  objectifs:["poids","condition"],  contraintes:["budget","sans_gluten"]},
  {id:145,nom:"Galettes de riz jambon",          proteines:["jambon"],   feculents:["riz"],      legumes:["salade"],     moment:["midi"],  tps:10, cal:360, p:26,g:42,l:9,  objectifs:["poids","maintenance"], contraintes:["budget","sans_gluten"]},

  // ── RAPIDES < 15 MIN ───────────────────────────────────
  {id:150,nom:"Salade express thon quinoa",      proteines:["thon"],     feculents:["quinoa"],   legumes:["tomate","salade"], moment:["midi"], tps:10, cal:400, p:32,g:38,l:10, objectifs:["poids"],             contraintes:["rapide","sans_gluten"]},
  {id:151,nom:"Wrap jambon crudités",            proteines:["jambon"],   feculents:["pain"],     legumes:["salade","tomate"], moment:["midi"], tps:8,  cal:380, p:26,g:40,l:10, objectifs:["poids","maintenance"], contraintes:["rapide"]},
  {id:152,nom:"Œufs brouillés & toasts",         proteines:["oeufs"],    feculents:["pain"],     legumes:["tomate"],     moment:["midi"],  tps:10, cal:360, p:22,g:32,l:16, objectifs:["maintenance"],        contraintes:["rapide","vegetarien"]},
  {id:153,nom:"Bol riz micro-ondes poulet",      proteines:["poulet"],   feculents:["riz"],      legumes:["haricots"],   moment:["midi"],  tps:12, cal:420, p:36,g:44,l:8,  objectifs:["poids","condition"],  contraintes:["rapide","sans_gluten"]},
  {id:154,nom:"Salade crevettes avocat",         proteines:["crevettes"],feculents:["quinoa"],   legumes:["salade","tomate"], moment:["midi"], tps:10, cal:390, p:30,g:32,l:14, objectifs:["poids"],            contraintes:["rapide","sans_gluten"]},
  {id:155,nom:"Saumon fumé & riz",               proteines:["poisson"],  feculents:["riz"],      legumes:["salade"],     moment:["midi"],  tps:10, cal:420, p:32,g:44,l:12, objectifs:["poids","maintenance"], contraintes:["rapide","sans_gluten"]},

  // ── ENFANTS AUSSI ──────────────────────────────────────
  {id:160,nom:"Nuggets maison & frites four",    proteines:["poulet"],   feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:30, cal:510, p:36,g:48,l:16, objectifs:["maintenance","renforcement"], contraintes:["enfants"]},
  {id:161,nom:"Pâtes bolognaise maison",         proteines:["boeuf"],    feculents:["pates"],    legumes:["tomate","carotte"], moment:["soir"], tps:35, cal:560, p:36,g:62,l:14, objectifs:["renforcement","maintenance"], contraintes:["enfants"]},
  {id:162,nom:"Poulet pané four riz",            proteines:["poulet"],   feculents:["riz"],      legumes:["haricots"],   moment:["soir"],  tps:25, cal:490, p:40,g:46,l:12, objectifs:["maintenance","condition"], contraintes:["enfants"]},
  {id:163,nom:"Pizza maison jambon fromage",     proteines:["jambon"],   feculents:["pain"],     legumes:["tomate"],     moment:["soir"],  tps:30, cal:540, p:32,g:58,l:18, objectifs:["maintenance"],        contraintes:["enfants"]},
  {id:164,nom:"Crêpes jambon fromage",           proteines:["jambon","oeufs"],feculents:["pain"],legumes:["champignon"], moment:["soir"],  tps:25, cal:480, p:28,g:50,l:18, objectifs:["maintenance"],        contraintes:["enfants"]},
  {id:165,nom:"Gratin de pâtes thon fromage",    proteines:["thon"],     feculents:["pates"],    legumes:["tomate"],     moment:["soir"],  tps:30, cal:510, p:34,g:58,l:16, objectifs:["maintenance"],        contraintes:["enfants"]},
  {id:166,nom:"Steak haché purée maison",        proteines:["boeuf"],    feculents:["pommes"],   legumes:["haricots"],   moment:["soir"],  tps:25, cal:530, p:40,g:42,l:18, objectifs:["renforcement"],       contraintes:["enfants","sans_gluten"]},
  {id:167,nom:"Saumon four & riz blanc",         proteines:["poisson"],  feculents:["riz"],      legumes:["haricots"],   moment:["soir"],  tps:20, cal:460, p:38,g:44,l:12, objectifs:["poids","condition"],  contraintes:["enfants","sans_gluten"]},

  // ── SOIR RÉCUPÉRATION SPORTIVE ─────────────────────────
  {id:170,nom:"Saumon riz brocoli (récup)",      proteines:["poisson"],  feculents:["riz"],      legumes:["brocoli"],    moment:["soir"],  tps:20, cal:490, p:42,g:46,l:14, objectifs:["condition","renforcement"], contraintes:["sans_gluten"]},
  {id:171,nom:"Poulet quinoa épinards (récup)",  proteines:["poulet"],   feculents:["quinoa"],   legumes:["epinards"],   moment:["soir"],  tps:25, cal:470, p:44,g:40,l:10, objectifs:["condition","renforcement"], contraintes:["sans_gluten"]},
  {id:172,nom:"Bœuf lentilles (récup force)",   proteines:["boeuf"],    feculents:["lentilles"],legumes:["epinards","carotte"], moment:["soir"], tps:30, cal:530, p:48,g:44,l:14, objectifs:["renforcement"],       contraintes:["sans_gluten"]},
  {id:173,nom:"Œufs patate douce (récup légère)",proteines:["oeufs"],   feculents:["patate_douce"],legumes:["epinards"], moment:["soir"],  tps:20, cal:420, p:26,g:44,l:14, objectifs:["poids","condition"],  contraintes:["sans_gluten","vegetarien"]},
  {id:174,nom:"Crevettes riz & légumes (récup)", proteines:["crevettes"],feculents:["riz"],      legumes:["brocoli","poivron"], moment:["soir"], tps:15, cal:450, p:36,g:48,l:10, objectifs:["condition","poids"], contraintes:["sans_gluten"]},

  // ── PLATS MIJOTÉS (passion cuisine) ───────────────────
  {id:180,nom:"Tajine poulet citron confit",     proteines:["poulet"],   feculents:["couscous"], legumes:["carotte","courgette"], moment:["soir"], tps:60, cal:540, p:42,g:52,l:14, objectifs:["maintenance"],        contraintes:[]},
  {id:181,nom:"Bœuf bourguignon allégé",         proteines:["boeuf"],    feculents:["pommes"],   legumes:["champignon","carotte"], moment:["soir"], tps:90, cal:520, p:44,g:36,l:18, objectifs:["maintenance","renforcement"], contraintes:["sans_gluten"]},
  {id:182,nom:"Poisson en papillote légumes",    proteines:["poisson"],  feculents:["pommes"],   legumes:["courgette","tomate"], moment:["soir"], tps:35, cal:420, p:36,g:34,l:12, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:183,nom:"Ratatouille & poulet rôti",       proteines:["poulet"],   feculents:["riz"],      legumes:["courgette","aubergine","tomate","poivron"], moment:["soir"], tps:50, cal:480, p:40,g:44,l:12, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:184,nom:"Daurade royale four provençale",  proteines:["poisson"],  feculents:["pommes"],   legumes:["tomate","courgette"], moment:["soir"], tps:40, cal:430, p:38,g:32,l:14, objectifs:["poids","maintenance"], contraintes:["sans_gluten"]},
  {id:185,nom:"Osso buco milanais",              proteines:["boeuf"],    feculents:["riz"],      legumes:["carotte","tomate"],   moment:["soir"],  tps:80, cal:560, p:44,g:46,l:18, objectifs:["maintenance","renforcement"], contraintes:["sans_gluten"]},

  // ── AUBERGINE spéciaux ─────────────────────────────────
  {id:190,nom:"Aubergines farcies bœuf",         proteines:["boeuf"],    feculents:["riz"],      legumes:["aubergine","tomate"], moment:["soir"], tps:45, cal:490, p:38,g:42,l:16, objectifs:["maintenance","renforcement"], contraintes:["sans_gluten"]},
  {id:191,nom:"Moussaka allégée",                proteines:["boeuf"],    feculents:["pommes"],   legumes:["aubergine","tomate"], moment:["soir"], tps:50, cal:480, p:36,g:38,l:18, objectifs:["maintenance"],        contraintes:["sans_gluten"]},
  {id:192,nom:"Imam bayildi (aubergines farcies végé)",proteines:["tofu"],feculents:["riz"],     legumes:["aubergine","tomate","poivron"], moment:["soir"], tps:45, cal:380, p:14,g:46,l:14, objectifs:["poids","maintenance"], contraintes:["vegetarien","sans_gluten"]},
];

// ═══════════════════════════════════════════════════════════
// SÉLECTION INTELLIGENTE DES REPAS
// ═══════════════════════════════════════════════════════════
function selectionnerRepas(proteines, feculents, legumes, contraintes, tempsMax, objectifs, moment, n=5) {
  const tpsMaxMin = tempsMax==="rapide"?15:tempsMax==="moyen"?30:120;
  let candidats = REPAS_DB.filter(r => {
    if (!r.moment.includes(moment)) return false;
    if (r.tps > tpsMaxMin) return false;
    const hasProteine = r.proteines.some(x=>proteines.includes(x));
    const hasFeculent = r.feculents.some(x=>feculents.includes(x));
    const hasLegume   = r.legumes.some(x=>legumes.includes(x));
    if (!hasProteine || !hasFeculent || !hasLegume) return false;
    const contOk = contraintes.filter(c=>c!=="aucune").every(c=>r.contraintes.includes(c)||c==="enfants");
    if (!contOk) return false;
    return true;
  });
  // Scorer
  candidats = candidats.map(r => {
    let score = 0;
    score += r.proteines.filter(x=>proteines.includes(x)).length * 3;
    score += r.feculents.filter(x=>feculents.includes(x)).length * 2;
    score += r.legumes.filter(x=>legumes.includes(x)).length * 2;
    score += r.objectifs.filter(x=>objectifs.includes(x)).length * 4;
    if (contraintes.includes("enfants") && r.contraintes.includes("enfants")) score += 5;
    score += Math.random() * 2; // légère randomisation
    return {...r, score};
  }).sort((a,b)=>b.score-a.score);
  // Diversifier les protéines
  const result=[]; const proteinesUsees=new Set();
  for (const r of candidats) {
    const pKey = r.proteines[0];
    if (!proteinesUsees.has(pKey) || result.length >= n-1) {
      result.push(r); proteinesUsees.add(pKey);
      if (result.length>=n) break;
    }
  }
  // Compléter si besoin
  if (result.length<n) {
    for (const r of candidats) {
      if (!result.find(x=>x.id===r.id)) { result.push(r); if (result.length>=n) break; }
    }
  }
  return result.slice(0,n);
}

// ═══════════════════════════════════════════════════════════
// EXERCICES À DEUX
// ═══════════════════════════════════════════════════════════
const EXOS_DEUX = {
  collectif:[
    {nom:"🤝 Squats face à face",         desc:"Face à face, mains croisées. Descendez ensemble, remontez ensemble. Synchronisation et soutien mutuel.", reps:"3×10", tag:"DUO"},
    {nom:"🎯 Passe & course",             desc:"Tu passes le ballon, il/elle sprinte le récupérer à 8m. Inversez les rôles.", reps:"10 chacun", tag:"DUO"},
    {nom:"🏋️ Gainage face à face",       desc:"En planche face à face. Donnez-vous la main droite pendant 3s, puis gauche. Restez stables !", reps:"3×6 échanges", tag:"DUO"},
    {nom:"⚡ Course miroir",              desc:"L'un mène, l'autre imite. Accélérations, décélérations, changements de direction. 20s puis inversez.", reps:"6×20s", tag:"DUO"},
    {nom:"🎮 Gardien & tireur",           desc:"Il/elle tire, tu gardes. Puis inversez. Comptez les buts, faites une compétition !", reps:"10 tirs chacun", tag:"FUN"},
    {nom:"💪 Pompes avec high five",      desc:"Côte à côte. Au signal, faites une pompe et donnez-vous un high five en haut. Coordination !", reps:"3×8", tag:"DUO"},
  ],
  raquette:[
    {nom:"🤝 Squats face à face",         desc:"Face à face, mains croisées. Descendez ensemble, synchronisés.", reps:"3×10", tag:"DUO"},
    {nom:"⚡ Course miroir",              desc:"L'un mène, l'autre imite en miroir. Déplacements latéraux, changements de sens.", reps:"6×20s", tag:"DUO"},
    {nom:"🎯 Réaction balle",             desc:"Tu tiens la balle en hauteur et la lâches. Il/elle doit l'attraper avant le 2ème rebond.", reps:"15 fois", tag:"DUO"},
    {nom:"💪 Gainage dos à dos",          desc:"Dos à dos. Passez un objet à droite puis à gauche alternativement. 30s.", reps:"3×30s", tag:"DUO"},
  ],
  endurance:[
    {nom:"🏃 Course côte à côte",         desc:"Courez ensemble à allure conversation. L'un donne le rythme, l'autre suit.", reps:"8 min", tag:"DUO"},
    {nom:"⚡ Course miroir",              desc:"L'un mène, l'autre imite. Accélérations progressives.", reps:"6×20s", tag:"DUO"},
    {nom:"💪 Gainage face à face",       desc:"En planche face à face. High five alternatif.", reps:"3×6 échanges", tag:"DUO"},
    {nom:"🎮 Défi chrono navette",       desc:"Chacun fait la navette 5-10-5m. On compare les temps. Gagnant fait moins de pompes !", reps:"3 essais", tag:"FUN"},
  ],
  combat:[
    {nom:"🥊 Mitaines imaginaires",       desc:"Tu fais semblant de tenir des mitaines. Il/elle frappe doucement en alternant droite/gauche.", reps:"3×20s", tag:"DUO"},
    {nom:"💪 Pompes avec high five",      desc:"Côte à côte, pompe + high five en haut. Coordination et rythme.", reps:"3×8", tag:"DUO"},
    {nom:"⚡ Course miroir",              desc:"L'un mène, l'autre imite. Déplacements en toutes directions.", reps:"6×20s", tag:"DUO"},
    {nom:"🤝 Gainage résistance",        desc:"En planche, l'un pousse l'épaule de l'autre légèrement. Rester stable !", reps:"3×20s", tag:"DUO"},
  ],
  gym:[
    {nom:"🤸 Équilibre soutenu",          desc:"Face à face, main dans la main. L'un lève la jambe, l'autre stabilise. 20s chaque.", reps:"3×20s/côté", tag:"DUO"},
    {nom:"💫 Squat sauté synchronisé",    desc:"Sautez ensemble en même temps. Qui reste synchronisé le plus longtemps ?", reps:"3×8", tag:"DUO"},
    {nom:"💪 Gainage face à face",       desc:"En planche face à face. High five alternatif sans perdre la position.", reps:"3×6", tag:"DUO"},
    {nom:"🎮 Défi équilibre",            desc:"Sur un pied, yeux fermés. Qui tient le plus longtemps ? Comptez ensemble.", reps:"5 essais chacun", tag:"FUN"},
  ],
  natation:[
    {nom:"⏱️ Timer & recorder",           desc:"L'un fait l'exercice, l'autre chronomètre et encourage. Puis inversez.", reps:"5 min", tag:"DUO"},
    {nom:"💪 Gainage face à face",       desc:"En planche face à face. High five sans bouger les hanches.", reps:"3×6", tag:"DUO"},
    {nom:"🎮 Défi saut",                 desc:"Saut en longueur sur place. Chacun marque sa distance. On bat son record ?", reps:"5 essais chacun", tag:"FUN"},
    {nom:"🏃 Course miroir",             desc:"L'un accélère, l'autre suit. Puis inversez les rôles.", reps:"6×20s", tag:"DUO"},
  ],
};

// ═══════════════════════════════════════════════════════════
// EXERCICES PAR ÂGE + SPORT + OBJECTIF
// ═══════════════════════════════════════════════════════════
function getAgeRules(age){
  if(age<=8)  return{fractionne:false,sprintMax:10,renfo:"très léger",label:"6-8 ans",  note:"Sprints courts, jeux, coordination. Zéro fractionné.",col:P.grass};
  if(age<=11) return{fractionne:false,sprintMax:20,renfo:"léger",     label:"9-11 ans", note:"Sprints jusqu'à 20m. Pas de fractionné enchaîné.",    col:P.sun};
  if(age<=14) return{fractionne:true, sprintMax:30,renfo:"modéré",    label:"12-14 ans",note:"Fractionné court OK. Renforcement poids de corps.",    col:P.orange};
  return            {fractionne:true, sprintMax:40,renfo:"complet",   label:"15+ ans",  note:"Programme quasi adulte. Tout est autorisé.",           col:P.coral};
}


// ═══════════════════════════════════════════════════════════
// BANQUE D'EXERCICES PAR SPORT V2 — SANS MATÉRIEL
// Blocs de 8 semaines · Séance A = Cardio/Technique · Séance B = Vivacité/Force
// ═══════════════════════════════════════════════════════════
const BANQUE={
  collectif:{
    A:[
      {b:1,nom:"Course en étoile",desc:"4 points à 5m de toi. Toucher chaque point depuis le centre et revenir. Rythme régulier.",reps:"3×4 tours",recup:"45s"},
      {b:1,nom:"Slalom imaginaire",desc:"10 pas à gauche, 10 à droite en zigzag. Regard devant, travail des appuis.",reps:"6 passages",recup:"30s"},
      {b:1,nom:"Course légère 8 min",desc:"Allure conversation. On peut parler en courant.",reps:"8 min",recup:null},
      {b:1,nom:"🎮 Chat et souris",desc:"Le parent court dans une zone de 10m, l'enfant essaie de le toucher. Rôles inversés.",reps:"3×1 min",recup:"30s",tag:"FUN"},
      {b:2,nom:"Navette 10m",desc:"Sprint 10m, demi-tour, retour. Enchaîner.",reps:"6 navettes",recup:"30s"},
      {b:2,nom:"Appuis latéraux",desc:"Pieds joints, sauts latéraux G/D. Atterrissage souple.",reps:"4×15s",recup:"20s"},
      {b:2,nom:"Fartlek 10 min",desc:"1 min allure + 30s rapide + 1 min allure. Le parent donne le signal.",reps:"5 cycles",recup:null},
      {b:2,nom:"🎮 Miroir",desc:"L'enfant copie tous les mouvements du parent. Changement de rôle toutes les 30s.",reps:"4×30s",recup:"20s",tag:"FUN"},
      {b:3,nom:"Circuit cardio",desc:"Course 2 min + 20 sauts + course 2 min. Sans pause.",reps:"3 circuits",recup:"1 min"},
      {b:3,nom:"Déplacement en carré",desc:"Carré imaginaire de 4m. Changer de direction au signal du parent.",reps:"5×30s",recup:"30s"},
      {b:3,nom:"Accélérations 30m",desc:"Partir lent, monter à 80% sur 30m. Contrôle total.",reps:"6×30m",recup:"45s"},
      {b:3,nom:"🎮 Course poursuite",desc:"Le parent a 3m d'avance. L'enfant doit le rattraper avant 20m.",reps:"6×",recup:"40s",tag:"DÉFI"},
      {b:4,nom:"Fartlek 15 min",desc:"1 min facile + 30s fort + 1 min facile. Alterner sans s'arrêter.",reps:"6 cycles",recup:null},
      {b:4,nom:"Course coordonnée",desc:"Courir en imitant différentes façons de courir : talons hauts, genoux hauts, bras croisés.",reps:"4×20m",recup:"30s"},
      {b:4,nom:"🎮 Relay challenge",desc:"Sprint 10m + 5 pompes + sprint retour. L'enfant vs parent. Chrono !",reps:"4 manches",recup:"1 min",tag:"DÉFI"},
    ],
    B:[
      {b:1,nom:"Sprint 15m",desc:"Départ position athlétique. Sprint max. Marche retour.",reps:"8×15m",recup:"40s"},
      {b:1,nom:"Départ assis",desc:"Assis au sol, signal → se lever et sprint 5m.",reps:"8×5m",recup:"30s"},
      {b:1,nom:"Gainage planche",desc:"Corps droit, avant-bras au sol. Fessiers serrés.",reps:"3×25s",recup:"20s"},
      {b:1,nom:"🎮 Réaction au signal",desc:"Parent dit GO au hasard → sprint 8m. Fausses alertes autorisées.",reps:"10×",recup:"30s",tag:"DÉFI"},
      {b:2,nom:"Sprint 20m",desc:"Accélération maximale sur 20m.",reps:"6×20m",recup:"45s"},
      {b:2,nom:"Pompes genoux",desc:"Descente 2s, montée explosive.",reps:"3×8",recup:"30s"},
      {b:2,nom:"Squat sauté",desc:"Descente contrôlée, explosion vers le haut, atterrissage souple.",reps:"3×8",recup:"35s"},
      {b:2,nom:"🎮 1 contre 1 zone",desc:"Zone 6×6m. L'enfant essaie de passer la ligne défendue par le parent.",reps:"4×1 min",recup:"30s",tag:"FUN"},
      {b:3,nom:"Sprint 25m + arrêt",desc:"Sprint max 25m, arrêt total au signal. Travail du freinage.",reps:"6×25m",recup:"50s"},
      {b:3,nom:"Pompes explosives",desc:"Descente lente 3s, poussée explosive.",reps:"3×6",recup:"35s"},
      {b:3,nom:"Fentes marchées",desc:"Grand pas avant, genou arrière près du sol.",reps:"3×8/jambe",recup:"30s"},
      {b:3,nom:"🎮 Défi sprint",desc:"10m chronométré. 3 essais chacun. Perdant fait 5 squats !",reps:"3 essais",recup:"1 min",tag:"DÉFI"},
      {b:4,nom:"Navette 5-10-5",desc:"Sprint 5m, demi-tour, 5m, demi-tour, 10m. La plus intense !",reps:"6 navettes",recup:"1 min"},
      {b:4,nom:"Burpee complet",desc:"Sol → pompe → relevé → saut bras levés.",reps:"3×6",recup:"45s"},
      {b:4,nom:"🎮 Circuit max",desc:"Sprint 10m + 5 burpees + retour. 3 rounds chrono.",reps:"3 rounds",recup:"1 min",tag:"DÉFI"},
    ],
  },
  raquette:{
    A:[
      {b:1,nom:"Pas chassés latéraux",desc:"2 zones à 4m. Se déplacer en pas chassés sans croiser les pieds.",reps:"4×15s",recup:"20s"},
      {b:1,nom:"Cardio 8 min",desc:"Course à allure conversation.",reps:"8 min",recup:null},
      {b:1,nom:"Coordination main-main",desc:"Face à face, frapper la main de l'autre en rythme. Accélérer progressivement.",reps:"3×30s",recup:"15s"},
      {b:1,nom:"🎮 Miroir latéral",desc:"Le parent fait des pas chassés, l'enfant copie en miroir.",reps:"4×20s",recup:"15s",tag:"FUN"},
      {b:2,nom:"Course en carré + pivots",desc:"Carré 4m. Course sur chaque côté avec pivot rapide aux angles.",reps:"5×30s",recup:"25s"},
      {b:2,nom:"Réaction directionnelle",desc:"Le parent pointe G ou D → l'enfant part dans cette direction en 1 pas explosif.",reps:"3×12",recup:"25s"},
      {b:2,nom:"Fartlek 10 min",desc:"1 min allure + 30s déplacements latéraux + 1 min allure.",reps:"5 cycles",recup:null},
      {b:2,nom:"🎮 Défense de zone",desc:"L'enfant doit toucher le parent dans une zone 4×4m.",reps:"3×1 min",recup:"30s",tag:"FUN"},
      {b:3,nom:"Sprint + pivot + retour",desc:"Sprint 6m, pivot sur avant-pied, sprint retour.",reps:"8×",recup:"35s"},
      {b:3,nom:"Déplacement avant-arrière",desc:"2 lignes à 5m. Course avant + course arrière. Ne jamais tourner le dos.",reps:"4×20s",recup:"25s"},
      {b:3,nom:"🎮 Course en étoile chrono",desc:"5 points à 3m. Les toucher tous le plus vite possible.",reps:"3 essais",recup:"45s",tag:"DÉFI"},
      {b:4,nom:"Circuit déplacements",desc:"Latéral 4m → avant 4m → latéral retour → arrière. 10 tours.",reps:"10 tours",recup:"1 min"},
      {b:4,nom:"Coordination complexe",desc:"Déplacement latéral + clap + déplacement inverse + saut.",reps:"4×12",recup:"30s"},
      {b:4,nom:"🎮 Défi multi-directionnel",desc:"Parent annonce direction + action. L'enfant exécute immédiatement.",reps:"20 actions",recup:"30s",tag:"DÉFI"},
    ],
    B:[
      {b:1,nom:"Sprint 10m",desc:"Explosivité courte distance — spécifique raquette.",reps:"8×10m",recup:"30s"},
      {b:1,nom:"Gainage planche",desc:"Stabilité du tronc = stabilité du geste.",reps:"3×25s",recup:"20s"},
      {b:1,nom:"Équilibre unipodal",desc:"Sur un pied, bras tendus. Proprioception = prévention cheville.",reps:"3×20s/pied",recup:"15s"},
      {b:1,nom:"🎮 Défi équilibre",desc:"Yeux fermés sur un pied. Qui tient le plus longtemps ?",reps:"5 essais",recup:"20s",tag:"FUN"},
      {b:2,nom:"Sprint + déplacement latéral",desc:"Sprint 8m puis 4m de déplacement latéral, retour.",reps:"6×",recup:"40s"},
      {b:2,nom:"Pompes",desc:"Force du haut du corps.",reps:"3×8",recup:"30s"},
      {b:2,nom:"Squat + saut",desc:"Squat profond, explosion vers le haut.",reps:"3×8",recup:"35s"},
      {b:2,nom:"🎮 Réaction",desc:"Parent crie G/D/avant/arrière, l'enfant part en sprint 2m.",reps:"15 actions",recup:"20s",tag:"DÉFI"},
      {b:3,nom:"Sprint + 3 pivots",desc:"Sprint 5m, pivot, 5m, pivot, 5m retour.",reps:"6×",recup:"45s"},
      {b:3,nom:"Fentes statiques",desc:"Position fente, tenir. Renforce les appuis.",reps:"3×20s/jambe",recup:"25s"},
      {b:3,nom:"🎮 Réaction multi",desc:"GO → toucher un point et revenir. Parent change le point pendant le trajet.",reps:"12×",recup:"30s",tag:"DÉFI"},
      {b:4,nom:"Navette 4m",desc:"Sprint 4m, demi-tour explosif. Distance courte = spécificité raquette.",reps:"10 navettes",recup:"35s"},
      {b:4,nom:"Burpee",desc:"Sol complet + saut.",reps:"3×6",recup:"45s"},
      {b:4,nom:"🎮 Sprint chronométré",desc:"Parcours 8m + pivot + 8m retour. Record à battre !",reps:"3 essais",recup:"1 min",tag:"DÉFI"},
    ],
  },
  endurance:{
    A:[
      {b:1,nom:"Course continue 10 min",desc:"Allure conversation — pouvoir parler en courant.",reps:"10 min",recup:null},
      {b:1,nom:"Respiration rythmée",desc:"Inspire 3 foulées, expire 3 foulées. Conscience respiratoire.",reps:"3 min",recup:null},
      {b:1,nom:"🎮 Course en duo",desc:"Courir ensemble à la même allure. Celui qui part devant ralentit.",reps:"8 min",recup:null,tag:"FUN"},
      {b:2,nom:"Course continue 14 min",desc:"Progression de la durée. Allure stable.",reps:"14 min",recup:null},
      {b:2,nom:"Foulées bondissantes",desc:"Exagérer la foulée, pousser fort sur chaque appui.",reps:"4×15m",recup:"45s"},
      {b:2,nom:"🎮 Record distance 1 min",desc:"1 minute de course, mesurer la distance. Battre son record !",reps:"2 essais",recup:"2 min",tag:"DÉFI"},
      {b:3,nom:"Fartlek 15 min",desc:"1 min facile + 30s rapide + 1 min facile. 6 cycles.",reps:"6 cycles",recup:null},
      {b:3,nom:"Montée de genoux",desc:"Lever les genoux à 90° à chaque foulée. Technique de course.",reps:"4×20m",recup:"45s"},
      {b:3,nom:"🎮 Course orientée",desc:"Parent désigne 4 objets. Parcourir les 4 le plus vite possible.",reps:"4×",recup:"1 min",tag:"FUN"},
      {b:4,nom:"Course continue 20 min",desc:"Progression maximale. Allure conversation maintenue.",reps:"20 min",recup:null},
      {b:4,nom:"Fractionné court",desc:"30s fort + 30s marche. Alternance effort/récup.",reps:"6 cycles",recup:null},
      {b:4,nom:"🎮 Chrono 400m",desc:"400m à allure libre, chronométré. Battre son record !",reps:"1×",recup:null,tag:"DÉFI"},
    ],
    B:[
      {b:1,nom:"Sprint 15m",desc:"Vitesse de pointe indispensable même en endurance.",reps:"6×15m",recup:"40s"},
      {b:1,nom:"Gainage planche",desc:"Foundation du coureur.",reps:"3×25s",recup:"20s"},
      {b:1,nom:"Squat",desc:"Force des jambes = efficacité de foulée.",reps:"3×10",recup:"30s"},
      {b:1,nom:"🎮 Saut longueur",desc:"Saut en longueur. 3 essais chacun.",reps:"3 essais",recup:"30s",tag:"FUN"},
      {b:2,nom:"Sprint 20m",desc:"Distance progressive.",reps:"6×20m",recup:"45s"},
      {b:2,nom:"Fentes marchées",desc:"Force des jambes sur 10m.",reps:"3×10m",recup:"30s"},
      {b:2,nom:"🎮 Saut + sprint",desc:"Saut en longueur + sprint 10m immédiatement.",reps:"5×",recup:"45s",tag:"DÉFI"},
      {b:3,nom:"Sprint 30m",desc:"Distance augmente avec la progression.",reps:"5×30m",recup:"1 min"},
      {b:3,nom:"Squat sauté",desc:"Explosion vers le haut. Puissance.",reps:"3×8",recup:"35s"},
      {b:3,nom:"🎮 Circuit force/vitesse",desc:"5 squats sautés + sprint 20m + 5 pompes. 3 tours chrono.",reps:"3 tours",recup:"1 min",tag:"DÉFI"},
      {b:4,nom:"Sprint 40m",desc:"Sprint long, maintenir jusqu'au bout.",reps:"5×40m",recup:"1 min"},
      {b:4,nom:"Burpee",desc:"Force + cardio + coordination.",reps:"3×6",recup:"45s"},
      {b:4,nom:"🎮 Record perso",desc:"Sprint 60m chronométré. Battre le record de la semaine 1 !",reps:"2 essais",recup:"2 min",tag:"DÉFI"},
    ],
  },
  combat:{
    A:[
      {b:1,nom:"Course légère 8 min",desc:"Cardio base de tout combat.",reps:"8 min",recup:null},
      {b:1,nom:"Déplacement en garde",desc:"Pieds dans l'axe, se déplacer en conservant la position de garde.",reps:"3×30s",recup:"20s"},
      {b:1,nom:"Rotation des hanches",desc:"Mains sur les hanches, rotation complète. Mobilité du bassin.",reps:"3×20",recup:"15s"},
      {b:1,nom:"🎮 Ombre imaginaire",desc:"Le parent joue l'adversaire en slow motion. L'enfant esquive.",reps:"3×30s",recup:"20s",tag:"FUN"},
      {b:2,nom:"Fractionné 30s/30s",desc:"30s effort + 30s récup. L'effort de combat est intermittent.",reps:"6 cycles",recup:null},
      {b:2,nom:"Chute arrière simulée",desc:"S'asseoir en roulant sur le dos, bras tendus pour amortir.",reps:"10×",recup:"20s"},
      {b:2,nom:"🎮 Miroir combat",desc:"Parent fait des mouvements de garde, l'enfant copie en miroir.",reps:"4×30s",recup:"20s",tag:"FUN"},
      {b:3,nom:"Fartlek combat",desc:"1 min allure + 20s sprint + 1 min allure. 5 cycles.",reps:"5 cycles",recup:null},
      {b:3,nom:"Souplesse axiale",desc:"Assis jambes écartées, se pencher vers chaque pied.",reps:"3×30s/côté",recup:"15s"},
      {b:3,nom:"🎮 Réaction directionnelle",desc:"Parent pointe → l'enfant sprinte 3m immédiatement. 15 réactions.",reps:"15×",recup:"20s",tag:"DÉFI"},
      {b:4,nom:"Circuit cardio combat",desc:"30s genoux hauts + 30s déplacements + 30s pompes + 30s repos. 5 tours.",reps:"5 tours",recup:"30s"},
      {b:4,nom:"Équilibre en garde",desc:"Position de garde yeux fermés. Proprioception.",reps:"3×20s",recup:"15s"},
      {b:4,nom:"🎮 Défi cardio",desc:"Qui tient le plus longtemps en chaise imaginaire (90°) ?",reps:"3 essais",recup:"30s",tag:"DÉFI"},
    ],
    B:[
      {b:1,nom:"Sprint départ bas",desc:"Position basse, genoux fléchis. Signal → explosion 8m.",reps:"8×8m",recup:"40s"},
      {b:1,nom:"Pompes genoux",desc:"Descente 2s, poussée explosive.",reps:"3×6",recup:"30s"},
      {b:1,nom:"Gainage planche",desc:"Foundation de toute technique de combat.",reps:"4×20s",recup:"20s"},
      {b:1,nom:"🎮 Résistance bras",desc:"Face à face, pousser les mains de l'autre. Qui cède ?",reps:"4×10s",recup:"20s",tag:"FUN"},
      {b:2,nom:"Pompes explosives",desc:"Descente lente 2s, montée explosive.",reps:"3×6",recup:"35s"},
      {b:2,nom:"Squat sauté",desc:"Amplitude complète, explosion vers le haut.",reps:"3×8",recup:"35s"},
      {b:2,nom:"🎮 Sumo imaginaire",desc:"Dans un cercle de 2m, faire sortir l'autre sans contact brutal.",reps:"5 rounds",recup:"20s",tag:"FUN"},
      {b:3,nom:"Sprint + arrêt brutal",desc:"Sprint 10m, stop total au signal.",reps:"8×10m",recup:"40s"},
      {b:3,nom:"Fentes explosives",desc:"Fente avant explosive, alterner rapidement.",reps:"3×10/jambe",recup:"35s"},
      {b:3,nom:"🎮 Défi force",desc:"Chaise imaginaire. Qui tient le plus longtemps ?",reps:"3 essais",recup:"30s",tag:"DÉFI"},
      {b:4,nom:"Burpee complet",desc:"Sol → pompe → relevé → saut.",reps:"3×6",recup:"45s"},
      {b:4,nom:"Sprint départ sol",desc:"Couché au sol, signal → se lever et sprint 10m.",reps:"6×10m",recup:"40s"},
      {b:4,nom:"🎮 Circuit max",desc:"1 min de burpees. Compter les répétitions !",reps:"3 essais",recup:"1 min",tag:"DÉFI"},
    ],
  },
  gym:{
    A:[
      {b:1,nom:"Marche artistique",desc:"Sur la pointe des pieds, bras tendus, regard loin. Grâce et posture.",reps:"3×20m",recup:"15s"},
      {b:1,nom:"Roulade avant",desc:"Menton rentré, dos arrondi. Gainage tout au long.",reps:"8×",recup:"20s"},
      {b:1,nom:"Équilibre arabesque",desc:"Un pied au sol, l'autre levé en arrière. Tenir la position.",reps:"3×15s/pied",recup:"15s"},
      {b:1,nom:"🎮 Statuette",desc:"Parent dit STOP → l'enfant s'immobilise dans n'importe quelle position.",reps:"10×",recup:"10s",tag:"FUN"},
      {b:2,nom:"Roulade arrière",desc:"S'asseoir en arrière, rouler sur le dos, jambes passent au-dessus.",reps:"6×",recup:"25s"},
      {b:2,nom:"Pont arrière statique",desc:"Mains et pieds au sol, ventre vers le ciel.",reps:"3×15s",recup:"20s"},
      {b:2,nom:"🎮 Chorégraphie impro",desc:"Inventer une mini-chorégraphie de 4 mouvements ensemble.",reps:"1×",recup:null,tag:"FUN"},
      {b:3,nom:"Roue latérale initiation",desc:"Partir de côté, poser les mains, jambes passent au-dessus.",reps:"6 tentatives",recup:"30s"},
      {b:3,nom:"Sauts coordination",desc:"Pieds joints → pieds écartés → jambes croisées → retour.",reps:"3×20s",recup:"20s"},
      {b:3,nom:"🎮 Défi souplesse",desc:"Qui arrive le plus bas dans un grand écart progressif ?",reps:"3 essais",recup:"20s",tag:"DÉFI"},
      {b:4,nom:"Combinaison sol",desc:"Roulade avant + saut + roulade arrière. Sans pause.",reps:"5×",recup:"30s"},
      {b:4,nom:"Séquence rythmée",desc:"6 gestes sur un rythme. Parent frappe dans les mains.",reps:"4×",recup:"20s"},
      {b:4,nom:"🎮 Spectacle maison",desc:"Préparer une mini-prestation de 30s ensemble !",reps:"1×",recup:null,tag:"FUN"},
    ],
    B:[
      {b:1,nom:"Gainage planche",desc:"En gym, la posture est tout.",reps:"3×25s",recup:"20s"},
      {b:1,nom:"Squat bras tendus",desc:"Descente contrôlée, bras tendus horizontaux.",reps:"3×10",recup:"25s"},
      {b:1,nom:"Sauts en hauteur",desc:"Genoux vers la poitrine. Réception souple.",reps:"3×8",recup:"30s"},
      {b:1,nom:"🎮 Défi équilibre",desc:"Sur un pied, yeux fermés. Qui tient le plus longtemps ?",reps:"5 essais",recup:"15s",tag:"DÉFI"},
      {b:2,nom:"Pompes",desc:"Force du haut du corps pour les appuis en gym.",reps:"3×6",recup:"30s"},
      {b:2,nom:"Squat sauté atterrissage parfait",desc:"Saut → atterrissage silencieux en position stable.",reps:"3×8",recup:"30s"},
      {b:2,nom:"🎮 Saut le plus haut",desc:"Saut vertical max. Marquer la hauteur sur un mur.",reps:"3 essais",recup:"30s",tag:"DÉFI"},
      {b:3,nom:"Superman",desc:"Ventre au sol, lever bras et jambes opposés. Force du dos.",reps:"3×10",recup:"25s"},
      {b:3,nom:"Rotation trunk",desc:"Assis en V, pieds levés, rotation droite/gauche.",reps:"3×12/côté",recup:"25s"},
      {b:3,nom:"🎮 Circuit gymnatique",desc:"5 sauts + 5 roulades + 5 pompes. 3 tours chrono.",reps:"3 tours",recup:"1 min",tag:"DÉFI"},
      {b:4,nom:"Planche complexe",desc:"Planche → monter sur les mains → revenir. Répéter.",reps:"3×6",recup:"30s"},
      {b:4,nom:"Gainage complet dynamique",desc:"Planche → latérale G → planche → latérale D → retour.",reps:"3×",recup:"30s"},
      {b:4,nom:"🎮 Force défi",desc:"Qui fait le plus de pompes parfaites ? Mêmes règles.",reps:"1 défi",recup:"1 min",tag:"DÉFI"},
    ],
  },
  natation:{
    A:[
      {b:1,nom:"Course légère 8 min",desc:"Cardio terrestre pour compléter la natation.",reps:"8 min",recup:null},
      {b:1,nom:"Rotations d'épaules",desc:"Grands cercles avant puis arrière, bras tendus.",reps:"3×15/sens",recup:"15s"},
      {b:1,nom:"🎮 Départ plongeon simulé",desc:"Sauter depuis debout en projetant les bras en avant.",reps:"8×",recup:"20s",tag:"FUN"},
      {b:2,nom:"Fartlek terrestre 12 min",desc:"1 min allure + 30s sprint + 1 min allure.",reps:"5 cycles",recup:null},
      {b:2,nom:"Mobilité chevilles",desc:"Rotations de cheville dans les deux sens.",reps:"3×20/sens",recup:"10s"},
      {b:2,nom:"🎮 Aquathlon imaginaire",desc:"Course 3 min + 10 sautillements + course 3 min.",reps:"2×",recup:"1 min",tag:"FUN"},
      {b:3,nom:"Circuit cardio",desc:"2 min course + 30s genoux hauts + 2 min course.",reps:"3 circuits",recup:"1 min"},
      {b:3,nom:"Rotation des bras en marche",desc:"Marcher en faisant des grands cercles de bras alternatifs. Simulation crawl.",reps:"4×20m",recup:"20s"},
      {b:3,nom:"🎮 Défi souffle",desc:"Expirer lentement en comptant. Qui expire le plus longtemps ?",reps:"3 essais",recup:"30s",tag:"DÉFI"},
      {b:4,nom:"Fractionné terrestre",desc:"Sprint 30s + marche 30s. 6 cycles.",reps:"6 cycles",recup:null},
      {b:4,nom:"Équilibre extension",desc:"Sur un pied, bras en avant (position plongeon). Tenir stable.",reps:"3×20s/pied",recup:"15s"},
      {b:4,nom:"🎮 Circuit nageur",desc:"10 rotations épaules + 10 sauts + sprint 20m. 4 tours.",reps:"4 tours",recup:"1 min",tag:"DÉFI"},
    ],
    B:[
      {b:1,nom:"Gainage planche",desc:"Position de nage sur terre.",reps:"4×20s",recup:"20s"},
      {b:1,nom:"Superman",desc:"Force du dos = position de nage.",reps:"3×10",recup:"25s"},
      {b:1,nom:"Pont fessier",desc:"Hanches vers le ciel. Force de propulsion.",reps:"3×10",recup:"25s"},
      {b:1,nom:"🎮 Saut longueur",desc:"Saut en longueur. 3 essais chacun.",reps:"3 essais",recup:"30s",tag:"FUN"},
      {b:2,nom:"Planche + levée de bras",desc:"En planche, lever un bras tendu, tenir 3s, alterner.",reps:"3×8/bras",recup:"25s"},
      {b:2,nom:"Squat",desc:"Force des jambes = propulsion.",reps:"3×10",recup:"30s"},
      {b:2,nom:"🎮 Défi saut",desc:"Saut vertical, marquer la hauteur sur un mur.",reps:"3 essais",recup:"30s",tag:"DÉFI"},
      {b:3,nom:"Gainage complexe",desc:"Planche → latérale → planche → latérale inverse.",reps:"4 tours",recup:"30s"},
      {b:3,nom:"Superman dynamique",desc:"Lever bras/jambes opposés en alternance rapide.",reps:"3×15",recup:"25s"},
      {b:3,nom:"🎮 Circuit nageur force",desc:"10 supermans + 10 ponts + 10 pompes. 3 tours.",reps:"3 tours",recup:"1 min",tag:"DÉFI"},
      {b:4,nom:"Squat sauté",desc:"Explosion vers le haut. Propulsion des jambes.",reps:"3×8",recup:"35s"},
      {b:4,nom:"Rotation trunk",desc:"Assis en V, pieds levés. Gainage oblique.",reps:"3×12/côté",recup:"25s"},
      {b:4,nom:"🎮 Record gainage",desc:"Qui tient le plus longtemps en planche ?",reps:"3 essais",recup:"1 min",tag:"DÉFI"},
    ],
  },
  generaliste:{
    A:[
      {b:1,nom:"Marche rapide 5 min",desc:"Échauffement ensemble. Bras actifs, regard droit.",reps:"5 min",recup:null},
      {b:1,nom:"Course légère 5 min",desc:"Allure très confortable. On peut chanter en courant.",reps:"5 min",recup:null},
      {b:1,nom:"🎮 Chat et souris",desc:"Le parent court, l'enfant essaie de le toucher.",reps:"3×1 min",recup:"30s",tag:"FUN"},
      {b:2,nom:"Course continue 10 min",desc:"Avancer ensemble, pas de compétition.",reps:"10 min",recup:null},
      {b:2,nom:"Slalom imaginaire",desc:"10 pas à gauche, 10 à droite en zigzag.",reps:"5 passages",recup:"25s"},
      {b:2,nom:"🎮 Miroir",desc:"Copier tous les mouvements du parent. Changement de rôle.",reps:"4×30s",recup:"20s",tag:"FUN"},
      {b:3,nom:"Fartlek 12 min",desc:"1 min allure + 30s rapide + 1 min allure.",reps:"5 cycles",recup:null},
      {b:3,nom:"Parcours imaginaire",desc:"Créer un parcours : sprint → roulade → saut sur un pied → retour.",reps:"4×",recup:"1 min"},
      {b:3,nom:"🎮 Course poursuite",desc:"3m d'avance au parent. L'enfant doit le rattraper avant 20m.",reps:"6×",recup:"40s",tag:"DÉFI"},
      {b:4,nom:"Circuit cardio",desc:"2 min course + 10 sauts + 10 genoux hauts + 2 min course.",reps:"3 tours",recup:"1 min"},
      {b:4,nom:"Fractionné fun",desc:"30s course + 30s danse + 30s course. Alterner.",reps:"5 cycles",recup:null},
      {b:4,nom:"🎮 Olympiades maison",desc:"3 épreuves inventées ensemble. On vote et on s'affronte !",reps:"3 épreuves",recup:null,tag:"FUN"},
    ],
    B:[
      {b:1,nom:"Sauts sur place",desc:"Sauts pieds joints, légers. Réveiller les jambes.",reps:"3×15",recup:"20s"},
      {b:1,nom:"Gainage planche",desc:"Corps droit comme une planche.",reps:"3×20s",recup:"20s"},
      {b:1,nom:"Squats",desc:"Comme s'asseoir sur une chaise imaginaire.",reps:"3×8",recup:"25s"},
      {b:1,nom:"🎮 Défi saut",desc:"Saut en longueur. Qui saute le plus loin ?",reps:"3 essais",recup:"20s",tag:"DÉFI"},
      {b:2,nom:"Sprint 10m",desc:"3… 2… 1… PARTEZ !",reps:"6×10m",recup:"30s"},
      {b:2,nom:"Pompes genoux",desc:"Lent à la descente, explosif à la montée.",reps:"3×6",recup:"30s"},
      {b:2,nom:"🎮 Réaction GO",desc:"Parent dit GO de façon aléatoire → sprint immédiat.",reps:"10×",recup:"30s",tag:"DÉFI"},
      {b:3,nom:"Sprint 15m",desc:"Distance progressive.",reps:"6×15m",recup:"40s"},
      {b:3,nom:"Fentes marchées",desc:"Grand pas avant, alterner.",reps:"3×8/jambe",recup:"30s"},
      {b:3,nom:"🎮 Circuit famille",desc:"5 squats + 5 sauts + 5 pompes. 3 tours chrono.",reps:"3 tours",recup:"1 min",tag:"DÉFI"},
      {b:4,nom:"Navette 10m",desc:"Sprint, demi-tour rapide, retour.",reps:"6 navettes",recup:"35s"},
      {b:4,nom:"Burpee simplifié",desc:"Sol → debout → saut. Sans pompe.",reps:"3×5",recup:"40s"},
      {b:4,nom:"🎮 Grand défi final",desc:"Inventer le défi ultime parent vs enfant !",reps:"1 défi",recup:null,tag:"FUN"},
    ],
  },
};

const EXOS_DUO=[
  {nom:"🤝 Sprint côte à côte",desc:"Sprint 15m en même temps. Départ main dans la main, lâcher au GO.",reps:"5×",tag:"DUO"},
  {nom:"🤝 Squat synchronisé",desc:"Face à face, mains dans les mains. Descente et montée au même rythme.",reps:"3×10",tag:"DUO"},
  {nom:"🤝 Course en duo liée",desc:"Courir ensemble à la même allure. Si l'un accélère, l'autre suit.",reps:"4 min",tag:"DUO"},
  {nom:"🤝 Gainage face à face",desc:"En planche, se regarder dans les yeux. Tenir ensemble sans rire !",reps:"3×25s",tag:"DUO"},
  {nom:"🤝 Relais 20m",desc:"Un sprinte 20m, l'autre attend et repart au toucher de main.",reps:"6 relais",tag:"DUO"},
  {nom:"🤝 Miroir parfait",desc:"Un fait des mouvements lents, l'autre copie en miroir exact.",reps:"3×30s",tag:"DUO"},
];

const ECHAUFF=[
  {nom:"🔥 Marche rapide",desc:"2 minutes pour activer le cœur et les articulations.",reps:"2 min",recup:null,tag:"ÉCHO"},
  {nom:"🔥 Rotations des bras",desc:"Grands cercles avant puis arrière. Mobiliser les épaules.",reps:"10/sens",recup:null,tag:"ÉCHO"},
  {nom:"🔥 Rotation des hanches",desc:"Mains sur les hanches, cercles larges. Activer le bassin.",reps:"10/sens",recup:null,tag:"ÉCHO"},
  {nom:"🔥 Genoux hauts",desc:"Lever les genoux alternativement à 90°. Activer les fléchisseurs.",reps:"20 pas",recup:null,tag:"ÉCHO"},
  {nom:"🔥 Talons-fesses",desc:"Ramener les talons vers les fesses en marchant.",reps:"20 pas",recup:null,tag:"ÉCHO"},
];

const RETOUR_CALME=[
  {nom:"🧘 Étirement quadriceps",desc:"Debout sur un pied, ramener le talon vers les fesses. 20s.",reps:"20s/jambe",recup:null,tag:"RETOUR"},
  {nom:"🧘 Étirement ischio",desc:"Assis, jambes tendues, se pencher vers les pieds. 20s.",reps:"20s",recup:null,tag:"RETOUR"},
  {nom:"🧘 Respiration profonde",desc:"Inspirer 4 temps, bloquer 2, expirer 6. Récupérer.",reps:"5 respirations",recup:null,tag:"RETOUR"},
];

function genProgramme(sport, objsEnfant, style, pathosE, pathosP, rules, semaine, duree, relation) {
  const bloc = semaine<=8?1:semaine<=16?2:semaine<=24?3:4;
  const sportKey = BANQUE[sport]?sport:"generaliste";
  const banque = BANQUE[sportKey];
  const asthme = pathosE.includes("Asthme");
  const genouxE = pathosE.includes("Genoux fragiles");

  let poolA = banque.A.filter(e=>e.b===bloc);
  let poolB = banque.B.filter(e=>e.b===bloc);

  if(asthme){
    poolA=poolA.filter(e=>!e.nom.toLowerCase().includes("sprint"));
    poolB=poolB.filter(e=>!e.nom.toLowerCase().includes("sprint"));
  }
  if(genouxE){
    poolB=poolB.filter(e=>!e.nom.toLowerCase().includes("sauté")&&!e.nom.toLowerCase().includes("saut"));
  }

  const duoIdx=(semaine-1)%EXOS_DUO.length;
  const duoEx=EXOS_DUO[duoIdx];

  return {
    seanceA:[...ECHAUFF,...poolA,duoEx,...RETOUR_CALME],
    seanceB:[...ECHAUFF,...poolB,duoEx,...RETOUR_CALME],
    bloc,
  };
}
const RELATIONS=[
  {id:"pere_fils",   label:"Papa & Fils",      icons:"👨‍👦",col:P.sky},
  {id:"pere_fille",  label:"Papa & Fille",     icons:"👨‍👧",col:P.pink},
  {id:"mere_fils",   label:"Maman & Fils",     icons:"👩‍👦",col:P.grass},
  {id:"mere_fille",  label:"Maman & Fille",    icons:"👩‍👧",col:P.purple},
  {id:"deux_parents",label:"Toute la famille", icons:"👨‍👩‍👦",col:P.orange},
  {id:"autre",       label:"Tuteur / Autre",   icons:"🤝",  col:P.coral},
];
const SPORTS={
  collectif:{label:"Sports collectifs",icon:"⚽",ex:"Foot, basket, rugby, handball",col:P.grass},
  raquette: {label:"Sports de raquette",icon:"🎾",ex:"Tennis, badminton, padel",   col:P.sun},
  endurance:{label:"Endurance",         icon:"🏃",ex:"Athlétisme, cross, vélo",    col:P.coral},
  combat:   {label:"Sports de combat",  icon:"🥊",ex:"Judo, karaté, boxe",         col:P.orange},
  gym:      {label:"Gym / Danse",       icon:"🤸",ex:"Gym, danse, patinage",       col:P.purple},
  natation: {label:"Natation",          icon:"🏊",ex:"Natation, water-polo",       col:P.sky},
};
const OBJ_ENFANT=[
  {id:"vitesse",     label:"Vitesse",      icon:"⚡",desc:"Démarrages & vivacité",    col:P.sun},
  {id:"technique",   label:"Technique",    icon:"🎯",desc:"Coordination & précision", col:P.sky},
  {id:"renforcement",label:"Renforcement", icon:"💪",desc:"Solidité & gainage",       col:P.coral},
  {id:"ludique",     label:"Ludique",      icon:"🎮",desc:"Jeux & défis rigolos",     col:P.grass},
  {id:"ete",         label:"Été",          icon:"☀️",desc:"Programme vacances fun",   col:P.orange},
];
const OBJ_PARENT=[
  {id:"poids",       label:"Perte de poids", icon:"🔥",desc:"Brûler des calories",    col:P.coral},
  {id:"condition",   label:"Condition",      icon:"⚡",desc:"Retrouver le rythme",    col:P.sky},
  {id:"renforcement",label:"Renforcement",   icon:"💪",desc:"Gainé & tonifié",        col:P.purple},
  {id:"maintenance", label:"Maintien",       icon:"⚖️",desc:"Garder la forme",        col:P.grass},
];
const STYLES=[
  {id:"ludique",  label:"Ludique",   icon:"🎮",desc:"Jeux, défis, compétitions"},
  {id:"structure",label:"Structuré", icon:"📋",desc:"Exercices précis, rigueur"},
  {id:"mixte",    label:"Mixte",     icon:"🔀",desc:"Le meilleur des deux"},
];
const DUREES=[
  {val:4, label:"4 sem.",  desc:"Boost rapide",      col:P.grass},
  {val:6, label:"6 sem.",  desc:"Résultats visibles", col:P.sky},
  {val:8, label:"8 sem.",  desc:"Programme complet",  col:P.purple},
  {val:12,label:"12 sem.", desc:"Transformation",     col:P.coral},
];
const PATHO_E=["Asthme","Genoux fragiles","Problèmes de dos","Surpoids","Aucune"];
const PATHO_P=["Mal de dos","Genoux","Hanches","Problèmes cardiaques","Hypertension","Aucune"];
const TROPHEES=[
  {s:1, icon:"🥉",label:"Premier pas",    desc:"1 semaine validée !"},
  {s:2, icon:"⚡",label:"Dans le rythme", desc:"2 semaines de régularité"},
  {s:3, icon:"🔥",label:"Habitude prise", desc:"3 semaines sans lâcher"},
  {s:4, icon:"🥈",label:"Un mois de feu", desc:"Un mois d'entraînement !"},
  {s:6, icon:"🎯",label:"Demi-chemin",    desc:"À mi-parcours, respect"},
  {s:8, icon:"🥇",label:"Programme fini", desc:"8 semaines accomplies !"},
  {s:12,icon:"🏆",label:"Champion",       desc:"12 semaines — légende !"},
];

// ═══════════════════════════════════════════════════════════
// SCHÉMAS SVG
// ═══════════════════════════════════════════════════════════
function Schema({type}){
  const s={
    sprint:(<svg viewBox="0 0 400 75" style={{width:"100%"}}><rect x="10" y="28" width="380" height="18" rx="4" fill="#1A2A1A" stroke={P.grass} strokeWidth="1"/><polygon points="24,19 33,36 15,36" fill={P.sun}/><text x="24" y="13" fill={P.sun} fontSize="9" textAnchor="middle" fontFamily="sans-serif">DÉPART</text><polygon points="358,19 367,36 349,36" fill={P.grass}/><text x="358" y="13" fill={P.grass} fontSize="9" textAnchor="middle" fontFamily="sans-serif">ARRIVÉE</text><line x1="36" y1="37" x2="342" y2="37" stroke={P.grass} strokeWidth="2.5"/><polygon points="342,32 360,37 342,42" fill={P.grass}/><path d="M360 37 Q290 10 36 37" stroke="#444" strokeWidth="1.5" fill="none" strokeDasharray="5,4"/><text x="200" y="8" fill="#666" fontSize="8" textAnchor="middle" fontFamily="sans-serif">marche retour</text></svg>),
    depart_assis:(<svg viewBox="0 0 400 80" style={{width:"100%"}}><rect x="10" y="44" width="280" height="16" rx="4" fill="#1A2A1A" stroke={P.grass} strokeWidth="1"/><text x="44" y="32" fill={P.sun} fontSize="9" fontFamily="sans-serif">Assis au sol</text><circle cx="44" cy="48" r="7" fill={P.sun}/><line x1="44" y1="55" x2="60" y2="60" stroke={P.sun} strokeWidth="2"/><line x1="60" y1="60" x2="72" y2="54" stroke={P.sun} strokeWidth="2"/><line x1="50" y1="47" x2="148" y2="47" stroke={P.grass} strokeWidth="2.5"/><polygon points="148,42 164,47 148,52" fill={P.grass}/><polygon points="166,36 176,53 156,53" fill={P.sun} opacity="0.9"/><text x="100" y="72" fill="#555" fontSize="8" textAnchor="middle" fontFamily="sans-serif">5m — 1er appui explosif</text><text x="340" y="52" fill={P.sun} fontSize="20" fontFamily="sans-serif">👏</text></svg>),
    slalom:(<svg viewBox="0 0 400 85" style={{width:"100%"}}>{[45,105,165,225,285,345].map((x,i)=>(<polygon key={i} points={`${x},${i%2===0?16:44} ${x+7},${i%2===0?32:60} ${x-7},${i%2===0?32:60}`} fill={P.sun}/>))}<path d="M45 24 Q75 52 105 52 Q135 52 165 24 Q195 -2 225 52 Q255 78 285 24 Q315 0 345 52" stroke={P.grass} strokeWidth="2" fill="none" strokeDasharray="5,3"/><text x="200" y="76" fill="#555" fontSize="8" textAnchor="middle" fontFamily="sans-serif">6 plots espacés 1m</text></svg>),
    planche:(<svg viewBox="0 0 400 72" style={{width:"100%"}}><rect x="10" y="58" width="380" height="5" rx="2" fill="#2A3A2A"/><ellipse cx="68" cy="44" rx="10" ry="10" fill={P.sun} opacity="0.9"/><line x1="68" y1="54" x2="68" y2="62" stroke={P.sun} strokeWidth="3"/><line x1="68" y1="62" x2="308" y2="62" stroke={P.sun} strokeWidth="3"/><line x1="68" y1="54" x2="44" y2="62" stroke={P.sun} strokeWidth="2.5"/><line x1="308" y1="62" x2="326" y2="56" stroke={P.sun} strokeWidth="2.5"/><line x1="326" y1="56" x2="348" y2="62" stroke={P.sun} strokeWidth="2"/><line x1="68" y1="42" x2="348" y2="58" stroke={P.grass} strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/><text x="200" y="22" fill="#555" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Corps aligné — avant-bras au sol</text></svg>),
    "4coins":(<svg viewBox="0 0 360 145" style={{width:"100%"}}><rect x="50" y="14" width="200" height="116" rx="5" fill="none" stroke="#2A3A4A" strokeWidth="1.5" strokeDasharray="8,4"/>{[[50,14],[250,14],[50,130],[250,130]].map(([x,y],i)=>(<polygon key={i} points={`${x},${y} ${x+9},${y+18} ${x-9},${y+18}`} fill={P.sun}/>))}<polygon points="150,62 158,78 142,78" fill={P.coral}/><text x="150" y="94" fill={P.coral} fontSize="8" textAnchor="middle" fontFamily="sans-serif">centre</text><line x1="52" y1="23" x2="140" y2="65" stroke={P.grass} strokeWidth="1.5" strokeDasharray="4,3"/><line x1="250" y1="23" x2="162" y2="65" stroke={P.grass} strokeWidth="1.5" strokeDasharray="4,3"/></svg>),
    navette:(<svg viewBox="0 0 400 95" style={{width:"100%"}}><rect x="10" y="40" width="380" height="16" rx="4" fill="#1A2A1A" stroke={P.grass} strokeWidth="1"/><polygon points="36,30 44,48 28,48" fill={P.coral}/><text x="36" y="22" fill={P.coral} fontSize="8" textAnchor="middle" fontFamily="sans-serif">Départ</text><polygon points="146,30 154,48 138,48" fill={P.sun}/><text x="146" y="22" fill={P.sun} fontSize="8" textAnchor="middle" fontFamily="sans-serif">5m</text><polygon points="306,30 314,48 298,48" fill={P.grass}/><text x="306" y="22" fill={P.grass} fontSize="8" textAnchor="middle" fontFamily="sans-serif">10m</text><line x1="46" y1="48" x2="134" y2="48" stroke={P.sun} strokeWidth="2.5"/><polygon points="134,43 148,48 134,53" fill={P.sun}/><path d="M148 52 Q100 74 46 52" stroke={P.coral} strokeWidth="1.5" fill="none" strokeDasharray="4,3"/><line x1="46" y1="56" x2="292" y2="56" stroke={P.grass} strokeWidth="2" strokeDasharray="5,3"/><polygon points="292,51 308,56 292,61" fill={P.grass}/><text x="200" y="82" fill="#555" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Demi-tour explosif ⚡</text></svg>),
    "1v1":(<svg viewBox="0 0 360 135" style={{width:"100%"}}><rect x="70" y="10" width="220" height="115" rx="6" fill="#0A1A0A" stroke="#2A4A2A" strokeWidth="1.5"/><rect x="140" y="10" width="80" height="7" rx="2" fill={P.grass} opacity="0.9"/><text x="180" y="8" fill={P.grass} fontSize="8" textAnchor="middle" fontFamily="sans-serif">But enfant</text><rect x="140" y="118" width="80" height="7" rx="2" fill={P.sun} opacity="0.9"/><text x="180" y="134" fill={P.sun} fontSize="8" textAnchor="middle" fontFamily="sans-serif">But parent</text><circle cx="160" cy="50" r="10" fill={P.grass}/><text x="160" y="53" fill="#fff" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Enfant</text><circle cx="200" cy="88" r="10" fill={P.sun}/><text x="200" y="91" fill="#000" fontSize="7" textAnchor="middle" fontFamily="sans-serif">Parent</text><circle cx="180" cy="69" r="5" fill="white" opacity="0.8"/></svg>),
    lateral:(<svg viewBox="0 0 400 72" style={{width:"100%"}}><rect x="10" y="32" width="380" height="16" rx="4" fill="#1A2A1A" stroke={P.grass} strokeWidth="1"/><polygon points="55,22 63,40 47,40" fill={P.sun}/><polygon points="345,22 353,40 337,40" fill={P.sun}/><line x1="63" y1="40" x2="333" y2="40" stroke={P.grass} strokeWidth="2" strokeDasharray="6,3"/><polygon points="333,35 349,40 333,45" fill={P.grass} opacity="0.7"/><polygon points="67,40 51,35 51,45" fill={P.grass} opacity="0.7"/><text x="200" y="62" fill="#555" fontSize="8" textAnchor="middle" fontFamily="sans-serif">Pas chassés rapides — 4 mètres</text></svg>),
    clap_sprint:(<svg viewBox="0 0 400 72" style={{width:"100%"}}><circle cx="58" cy="36" r="8" fill={P.grass}/><text x="58" y="56" fill={P.grass} fontSize="7" textAnchor="middle" fontFamily="sans-serif">Enfant</text><circle cx="350" cy="36" r="8" fill={P.sun}/><text x="350" y="56" fill={P.sun} fontSize="7" textAnchor="middle" fontFamily="sans-serif">Parent</text><line x1="70" y1="36" x2="218" y2="36" stroke={P.grass} strokeWidth="2.5"/><polygon points="218,31 235,36 218,41" fill={P.grass}/><polygon points="237,26 248,42 226,42" fill={P.sun} opacity="0.9"/><text x="350" y="18" fill={P.sun} fontSize="20" textAnchor="middle" fontFamily="sans-serif">👏</text></svg>),
  };
  if(!s[type]) return null;
  return(<div style={{background:"#0D1B0D",border:"1px solid #1E3A1E",borderRadius:10,padding:"10px 14px",margin:"8px 0"}}><div style={{fontSize:9,letterSpacing:2,color:P.grass,textTransform:"uppercase",marginBottom:6,fontFamily:"sans-serif"}}>📐 Schéma</div>{s[type]}</div>);
}

// ═══════════════════════════════════════════════════════════
// ATOMS
// ═══════════════════════════════════════════════════════════
function calcIMC(poids,taille){
  if(!poids||!taille||taille<50) return null;
  const v=poids/((taille/100)**2);
  let cat,col;
  if(v<18.5){cat="Insuffisance pondérale";col=P.sky;}
  else if(v<25){cat="Poids normal ✓";col=P.grass;}
  else if(v<30){cat="Surpoids";col=P.sun;}
  else{cat="Obésité";col=P.coral;}
  return{val:v.toFixed(1),cat,col};
}
function calcAge(jour,mois,annee){
  const today=new Date();
  const birth=new Date(parseInt(annee),parseInt(mois)-1,parseInt(jour));
  let age=today.getFullYear()-birth.getFullYear();
  const m=today.getMonth()-birth.getMonth();
  if(m<0||(m===0&&today.getDate()<birth.getDate()))age--;
  return Math.max(0,age);
}
const INP={background:P.navy,border:`1.5px solid ${P.navyLL}`,borderRadius:10,color:P.offW,padding:"11px 14px",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"};
function Chip({icon,label,desc,col,active,onClick}){
  return(<button onClick={onClick} style={{background:active?col:P.navyLL,border:`2px solid ${active?col:"transparent"}`,borderRadius:14,padding:"12px 10px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all .15s",transform:active?"scale(1.04)":"scale(1)",boxShadow:active?`0 0 16px ${col}55`:"none",width:"100%"}}>
    <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
    <div style={{color:active?"#fff":P.offW,fontWeight:700,fontSize:12}}>{label}</div>
    {desc&&<div style={{color:active?"rgba(255,255,255,.7)":P.gray,fontSize:10,marginTop:2}}>{desc}</div>}
  </button>);
}
function Toggle({icon,label,col,active,onClick}){
  return(<button onClick={onClick} style={{background:active?col+"22":"transparent",border:`2px solid ${active?col:P.navyLL}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",color:active?col:P.gray,fontSize:12,fontWeight:600,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>
    <span>{icon}</span>{label}{active&&<span style={{marginLeft:4,fontSize:9,background:col,color:"#fff",borderRadius:4,padding:"1px 5px"}}>✓</span>}
  </button>);
}
function Card({children,col,style:xs}){return(<div style={{background:P.navyL,border:`1.5px solid ${col?col+"44":P.navyLL}`,borderRadius:20,marginBottom:16,overflow:"hidden",boxShadow:col?`0 4px 24px ${col}18`:"none",...xs}}>{children}</div>);}
function CH({icon,title,sub,col}){return(<div style={{background:`linear-gradient(90deg,${col}28,transparent)`,borderLeft:`4px solid ${col}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${P.navyLL}`}}><span style={{fontSize:28}}>{icon}</span><div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:20,color:col,letterSpacing:.5}}>{title}</div>{sub&&<div style={{color:P.gray,fontSize:11}}>{sub}</div>}</div></div>);}
function ST({icon,title,sub,col}){return(<div style={{marginBottom:18}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:26}}>{icon}</span><div style={{fontFamily:"'Fredoka One', cursive",fontSize:26,color:col||P.white,letterSpacing:1}}>{title}</div></div>{sub&&<div style={{color:P.gray,fontSize:12,letterSpacing:1,paddingLeft:36}}>{sub}</div>}</div>);}

// ═══════════════════════════════════════════════════════════
// SÉANCE CARD
// ═══════════════════════════════════════════════════════════
function SeanceCard({titre,icon,objectif,exercices,col,enfantPrenom,parentPrenom}){
  const [open,setOpen]=useState(true);
  const tagC={"DÉFI":P.coral,"FUN":P.purple,"PROGRESSION":P.sky,"DUO":P.grass};
  return(<Card col={col}><CH icon={icon} title={titre} sub={objectif} col={col}/>
    <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",color:P.gray,fontSize:11,padding:"8px 18px",cursor:"pointer",textAlign:"right",fontFamily:"inherit",letterSpacing:1}}>
      {open?"▲ Réduire":"▼ Voir les exercices"}
    </button>
    {open&&<div style={{padding:"0 18px 18px"}}>
      <div style={{color:P.gray,fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>🔥 Échauffement — 8 min</div>
      <div style={{color:P.gray,fontSize:12,marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${P.navyLL}`}}>Jogging léger × 2 tours · Éducatifs · Passes / échanges à deux</div>
      <div style={{color:P.gray,fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>⚡ Bloc principal</div>
      {exercices.map((ex,i)=>(
        <div key={i} style={{borderBottom:i<exercices.length-1?`1px solid ${P.navyLL}`:"none",padding:"12px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:P.white,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                {ex.nom}
                {ex.tag&&<span style={{background:tagC[ex.tag]||P.grass,color:"#fff",fontSize:9,padding:"2px 7px",borderRadius:5,letterSpacing:1}}>{ex.tag}</span>}
              </div>
              <div style={{color:P.gray,fontSize:12,marginTop:3}}>{ex.desc}</div>
              {ex.recup&&<div style={{color:"#445",fontSize:11,marginTop:2}}>Récup : {ex.recup}</div>}
              {ex.adapte&&<div style={{color:ex.adapte.startsWith("✓")?P.grass:P.orange,fontSize:11,marginTop:3}}>{ex.adapte}</div>}
            </div>
            <div style={{background:P.navy,border:`1.5px solid ${P.navyLL}`,borderRadius:8,padding:"6px 11px",fontSize:13,fontFamily:"'Fredoka One', cursive",color:P.white,whiteSpace:"nowrap",minWidth:70,textAlign:"center"}}>{ex.reps}</div>
          </div>
          {ex.schema&&<Schema type={ex.schema}/>}
        </div>
      ))}
      <div style={{background:P.navy,borderLeft:`3px solid ${P.sun}`,padding:"10px 14px",borderRadius:"0 10px 10px 0",marginTop:14}}>
        <div style={{color:P.sun,fontSize:10,letterSpacing:1,marginBottom:3}}>👨 {parentPrenom||"LE PARENT"} SUIT</div>
        <div style={{color:P.gray,fontSize:12}}>Tu fais les mêmes exercices. L'objectif c'est {enfantPrenom||"l'enfant"}. Toi c'est du bonus 💪</div>
      </div>
    </div>}
  </Card>);
}

// ═══════════════════════════════════════════════════════════
// DONNÉES ACTIVITÉS LIBRES
// ═══════════════════════════════════════════════════════════
const ACTIVITES=[
  {id:"course",   icon:"🏃",label:"Course à pied",  unit:"km",  col:"#FF6B6B"},
  {id:"velo",     icon:"🚴",label:"Vélo",           unit:"km",  col:"#FFD93D"},
  {id:"marche",   icon:"🚶",label:"Marche / Rando", unit:"km",  col:"#3DDC84"},
  {id:"natation", icon:"🏊",label:"Natation",       unit:"m",   col:"#38C9F0"},
  {id:"roller",   icon:"🛼",label:"Roller / Skate", unit:"km",  col:"#A78BFA"},
  {id:"foot",     icon:"⚽",label:"Foot libre",     unit:"min", col:"#2db055"},
  {id:"basket",   icon:"🏀",label:"Basket libre",   unit:"min", col:"#FF9F43"},
  {id:"autre",    icon:"🎯",label:"Autre activité", unit:"min", col:"#8892B0"},
];

const POSTS_DEMO=[
  {id:1,auteur:"Marc & Tom",avatar:"👨‍👦",activite:"course",icon:"🏃",desc:"5.2 km en 32 min",details:"6:09 /km · 287 kcal",lieu:"Parc de la Tête d'Or, Lyon",photo:"🌳",temps:"Il y a 2h",likes:14,comments:[{auteur:"Sophie & Léa",txt:"Bravo les gars ! 💪"},{auteur:"Pierre & Jules",txt:"On vous bat la semaine prochaine 😄"}]},
  {id:2,auteur:"Sophie & Léa",avatar:"👩‍👧",activite:"velo",icon:"🚴",desc:"12.8 km en 44 min",details:"17.4 km/h · 320 kcal",lieu:"Bords de Saône",photo:"🌅",temps:"Il y a 5h",likes:22,comments:[{auteur:"Marc & Tom",txt:"Superbe parcours !"},{auteur:"Camille & Noa",txt:"On adore ce coin ! ❤️"}]},
  {id:3,auteur:"Pierre & Jules",avatar:"👨‍👦",activite:"marche",icon:"🚶",desc:"4.1 km en 55 min",details:"7.5 km/h · 198 kcal",lieu:"Forêt de Fontainebleau",photo:"🏔️",temps:"Hier",likes:8,comments:[{auteur:"Sophie & Léa",txt:"La rando c'est trop bien !"}]},
  {id:4,auteur:"Camille & Noa",avatar:"👩‍👦",activite:"course",icon:"🏃",desc:"3.7 km en 28 min",details:"7:34 /km · 210 kcal",lieu:"Bois de Boulogne, Paris",photo:"🌿",temps:"Hier",likes:31,comments:[{auteur:"Marc & Tom",txt:"🔥🔥🔥"},{auteur:"Pierre & Jules",txt:"Noa il court vite !"},{auteur:"Admin DuoSport",txt:"Super sortie duo ! 🏆"}]},
];

// ═══════════════════════════════════════════════════════════
// ONGLET ENTRAÎNEMENT LIBRE
// ═══════════════════════════════════════════════════════════
function LibreTab({p,PAL,Card,CH,ST,Toggle,INP}){
  const [phase,setPhase]=useState("choix");
  const [activite,setActivite]=useState(null);
  const [enCours,setEnCours]=useState(false);
  const [temps,setTemps]=useState(0);
  const [distance,setDistance]=useState("");
  const [note,setNote]=useState("");
  const [partager,setPartager]=useState(true);
  const [historique,setHistorique]=useState([]);
  const [timerRef,setTimerRef]=useState(null);
  const [lieu,setLieu]=useState("");
  const act=ACTIVITES.find(a=>a.id===activite);

  function demarrer(){setEnCours(true);setTemps(0);const t=setInterval(()=>setTemps(prev=>prev+1),1000);setTimerRef(t);}
  function arreter(){clearInterval(timerRef);setEnCours(false);setPhase("fin");}
  function fmt(s){const m=Math.floor(s/60);const sec=s%60;return`${m}:${sec.toString().padStart(2,"0")}`;}
  function vitesse(){if(!distance||!temps||temps===0)return null;const d=parseFloat(distance);const h=temps/3600;if(act?.id==="natation")return null;return(d/h).toFixed(1);}
  function calories(){if(!temps)return 0;const met=act?.id==="velo"?8:act?.id==="natation"?7:act?.id==="marche"?4:9;const poids=parseInt(p.parentPoids)||75;return Math.round(met*poids*(temps/3600));}
  async function publier(){
    const newPost={
      auteur:`${p.parentPrenom||"Vous"} & ${p.enfantPrenom||"Votre enfant"}`,
      avatar:p.relation?.includes("mere")?"👩‍👦":"👨‍👦",
      activite,icon:act?.icon,
      desc:`${distance||"—"} ${act?.unit} en ${fmt(temps)}`,
      details:vitesse()?`${vitesse()} km/h · ${calories()} kcal`:`${calories()} kcal`,
      lieu:lieu||"Votre ville",photo:"🌳",
      likes:0,note
    };
    try {
      await supabase.from("duosport_posts").insert(newPost);
    } catch(e){}
    setHistorique(prev=>[{...newPost,id:Date.now(),temps:"À l'instant"},...prev]);
    setPhase("bravo");setDistance("");setNote("");setLieu("");
  }

  return(<div>
    <ST icon="🏃" title="Entraînement Libre" sub="Sortez, enregistrez, partagez !" col={PAL.coral}/>

    {phase==="choix"&&<>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:PAL.white,marginBottom:14}}>Quelle activité aujourd'hui ?</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
        {ACTIVITES.map(a=>(<button key={a.id} onClick={()=>setActivite(a.id)} style={{background:activite===a.id?a.col+"33":PAL.navyL,border:`2px solid ${activite===a.id?a.col:"transparent"}`,borderRadius:14,padding:"14px 8px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all .15s",boxShadow:activite===a.id?`0 0 16px ${a.col}44`:"none"}}>
          <div style={{fontSize:28,marginBottom:6}}>{a.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:activite===a.id?a.col:PAL.gray}}>{a.label}</div>
        </button>))}
      </div>

      {activite&&<Card col={act?.col}>
        <CH icon={act?.icon} title={`Sortie ${act?.label}`} sub="Prêt à démarrer ?" col={act?.col}/>
        <div style={{padding:"16px 18px"}}>
          <div style={{background:PAL.navy,border:`1.5px solid ${PAL.navyLL}`,borderRadius:12,padding:"16px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontFamily:"'Fredoka One', cursive",fontSize:48,color:act?.col}}>00:00</div>
            <div style={{color:PAL.gray,fontSize:12,marginTop:4}}>Le chrono démarrera quand vous serez prêt</div>
          </div>
          <div style={{marginBottom:14}}><label style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Lieu (optionnel)</label><input style={INP} value={lieu} onChange={e=>setLieu(e.target.value)} placeholder="Parc, bords de rivière..."/></div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><Toggle icon="🌍" label="Partager dans la communauté" col={PAL.grass} active={partager} onClick={()=>setPartager(v=>!v)}/></div>
          <button onClick={()=>{setPhase("tracking");demarrer();}} style={{width:"100%",background:`linear-gradient(135deg,${act?.col},${act?.col}bb)`,color:"#fff",border:"none",borderRadius:14,padding:"16px",fontSize:18,fontFamily:"'Fredoka One', cursive",cursor:"pointer",boxShadow:`0 6px 24px ${act?.col}55`,letterSpacing:1}}>▶ Démarrer la sortie !</button>
        </div>
      </Card>}

      {historique.length>0&&<><div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:PAL.white,marginBottom:12,marginTop:8}}>📋 Mes dernières sorties</div>
        {historique.slice(0,3).map((s,i)=>(<div key={i} style={{background:PAL.navyL,border:`1.5px solid ${PAL.navyLL}`,borderRadius:14,padding:"14px 18px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:32}}>{ACTIVITES.find(a=>a.id===s.activite)?.icon}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,color:PAL.white,fontSize:14}}>{s.desc}</div><div style={{color:PAL.gray,fontSize:12}}>{s.details} · {s.lieu}</div></div>
          <div style={{color:PAL.gray,fontSize:11}}>{s.temps}</div>
        </div>))}
      </>}
    </>}

    {phase==="tracking"&&act&&<Card col={act.col}>
      <CH icon={act.icon} title={`${act.label} en cours...`} sub={lieu||"Bonne sortie !"} col={act.col}/>
      <div style={{padding:"24px 18px",textAlign:"center"}}>
        <div style={{background:PAL.navy,borderRadius:20,padding:"24px",marginBottom:20,border:`2px solid ${act.col}33`}}>
          <div style={{fontSize:11,color:PAL.gray,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>⏱ DURÉE</div>
          <div style={{fontFamily:"'Fredoka One', cursive",fontSize:64,color:act.col,lineHeight:1}}>{fmt(temps)}</div>
          <div style={{color:PAL.gray,fontSize:12,marginTop:6}}>{enCours?<span style={{color:PAL.grass}}>● EN COURS</span>:"En pause"}</div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>Distance ({act.unit}) — saisie manuelle</label>
          <input style={{...INP,textAlign:"center",fontSize:24,fontFamily:"'Fredoka One', cursive",color:act.col}} type="number" step="0.1" value={distance} onChange={e=>setDistance(e.target.value)} placeholder={`0.0 ${act.unit}`}/>
        </div>
        {distance&&temps>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {vitesse()&&<div style={{background:act.col+"18",border:`1px solid ${act.col}33`,borderRadius:12,padding:"12px"}}><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Vitesse moy.</div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:26,color:act.col}}>{vitesse()} <span style={{fontSize:14}}>km/h</span></div></div>}
          <div style={{background:PAL.coral+"18",border:`1px solid ${PAL.coral}33`,borderRadius:12,padding:"12px"}}><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Calories</div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:26,color:PAL.coral}}>{calories()} <span style={{fontSize:14}}>kcal</span></div></div>
        </div>}
        <button onClick={arreter} style={{width:"100%",background:"linear-gradient(135deg,#FF4444,#FF6B6B)",color:"#fff",border:"none",borderRadius:14,padding:"18px",fontSize:18,fontFamily:"'Fredoka One', cursive",cursor:"pointer",boxShadow:"0 6px 24px rgba(255,68,68,.5)",letterSpacing:1}}>⏹ Terminer la sortie</button>
        <div style={{color:PAL.gray,fontSize:11,marginTop:10}}>Appuyez quand vous êtes rentré</div>
      </div>
    </Card>}

    {phase==="fin"&&act&&<Card col={act.col}>
      <CH icon="🏅" title="Sortie terminée !" sub="Super effort !" col={act.col}/>
      <div style={{padding:"20px 18px"}}>
        <div style={{background:PAL.navy,borderRadius:16,padding:"20px",marginBottom:18}}>
          <div style={{fontFamily:"'Fredoka One', cursive",fontSize:16,color:act.col,marginBottom:14}}>📊 Votre récapitulatif</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One', cursive",fontSize:28,color:PAL.white}}>{fmt(temps)}</div><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>Durée</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One', cursive",fontSize:28,color:act.col}}>{distance||"—"} <span style={{fontSize:14}}>{act.unit}</span></div><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>Distance</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One', cursive",fontSize:28,color:PAL.coral}}>{calories()}</div><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>Kcal</div></div>
          </div>
          {vitesse()&&<div style={{textAlign:"center",marginTop:14,paddingTop:14,borderTop:`1px solid ${PAL.navyLL}`}}><div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:PAL.sun}}>{vitesse()} km/h</div><div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>Vitesse moyenne</div></div>}
        </div>
        <div style={{marginBottom:14}}><label style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>💬 Une note sur cette sortie (optionnel)</label><textarea style={{...INP,height:70,resize:"none"}} value={note} onChange={e=>setNote(e.target.value)} placeholder={`Super sortie avec ${p.enfantPrenom||"mon enfant"} !`}/></div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><Toggle icon="🌍" label="Partager dans la communauté DuoSport" col={PAL.grass} active={partager} onClick={()=>setPartager(v=>!v)}/></div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={publier} style={{flex:1,background:`linear-gradient(135deg,${PAL.grass},${PAL.sky})`,color:"#fff",border:"none",borderRadius:14,padding:"15px",fontSize:16,fontFamily:"'Fredoka One', cursive",cursor:"pointer",boxShadow:`0 4px 20px ${PAL.grass}44`,letterSpacing:1}}>✅ Enregistrer{partager?" & Partager":""}</button>
          <button onClick={()=>{setPhase("choix");setTemps(0);setDistance("");}} style={{background:PAL.navyL,color:PAL.gray,border:`1px solid ${PAL.navyLL}`,borderRadius:14,padding:"15px 18px",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
        </div>
      </div>
    </Card>}

    {phase==="bravo"&&<div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:72,marginBottom:16}}>🎉</div>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:32,color:PAL.grass,marginBottom:8}}>Sortie enregistrée !</div>
      {partager&&<div style={{color:PAL.gray,fontSize:14,marginBottom:24}}>Votre sortie est visible dans la communauté DuoSport 🌍</div>}
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={()=>setPhase("choix")} style={{background:PAL.grass,color:"#fff",border:"none",borderRadius:12,padding:"13px 24px",fontSize:15,fontFamily:"'Fredoka One', cursive",cursor:"pointer"}}>🏃 Nouvelle sortie</button>
        <button onClick={()=>setPhase("choix")} style={{background:PAL.navyL,color:PAL.gray,border:`1px solid ${PAL.navyLL}`,borderRadius:12,padding:"13px 24px",fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>Voir la communauté →</button>
      </div>
    </div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════
// ONGLET COMMUNAUTÉ
// ═══════════════════════════════════════════════════════════
function PostCard({post,p,PAL,onLike,isLiked,onComment,commentaire,setCommentaire}){
  const [showCom,setShowCom]=useState(false);
  const [localComments,setLocalComments]=useState([]);
  const actData=ACTIVITES.find(a=>a.id===post.activite);
  const tempsAffiche=post.created_at?new Date(post.created_at).toLocaleDateString("fr-FR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"";

  async function chargerComments(){
    try{
      const {data}=await supabase.from("duosport_comments").select("*").eq("post_id",String(post.id)).order("created_at",{ascending:true});
      if(data) setLocalComments(data);
    }catch(e){}
  }

  async function envoyerComment(){
    const txt=commentaire[post.id];
    if(!txt||!txt.trim())return;
    const auteur=`${p.parentPrenom||"Vous"} & ${p.enfantPrenom||"Enfant"}`;
    try{
      await supabase.from("duosport_comments").insert({post_id:String(post.id),auteur,txt});
      setCommentaire(prev=>({...prev,[post.id]:""}));
      chargerComments();
    }catch(e){}
  }

  return(<div style={{background:PAL.navyL,border:`1.5px solid ${PAL.navyLL}`,borderRadius:20,marginBottom:16,overflow:"hidden"}}>
    <div style={{padding:"16px 18px 0",display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:44,height:44,borderRadius:"50%",background:(actData?.col||PAL.grass)+"22",border:`2px solid ${(actData?.col||PAL.grass)}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{post.avatar||"👤"}</div>
      <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:PAL.white}}>{post.auteur}</div><div style={{fontSize:11,color:PAL.gray,marginTop:2}}>📍 {post.lieu} · {tempsAffiche}</div></div>
      <div style={{background:(actData?.col||PAL.grass)+"22",border:`1px solid ${(actData?.col||PAL.grass)}44`,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14}}>{post.icon}</span><span style={{fontSize:10,color:actData?.col||PAL.grass,fontWeight:700}}>{actData?.label||post.activite}</span></div>
    </div>
    <div style={{margin:"14px 18px",background:PAL.navy,borderRadius:14,padding:"14px 16px"}}>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:actData?.col||PAL.grass,marginBottom:4}}>{post.desc}</div>
      <div style={{fontSize:12,color:PAL.gray}}>{post.details}</div>
      {post.note&&<div style={{fontSize:13,color:PAL.offW,marginTop:8,paddingTop:8,borderTop:`1px solid ${PAL.navyLL}`,fontStyle:"italic"}}>"{post.note}"</div>}
    </div>
    <div style={{margin:"0 18px 14px",background:`linear-gradient(135deg,${(actData?.col||PAL.grass)}18,${PAL.navyLL})`,borderRadius:12,padding:"20px",textAlign:"center",fontSize:48}}>{post.photo||"🌳"}</div>
    <div style={{padding:"0 18px 14px",display:"flex",alignItems:"center",gap:12}}>
      <button onClick={()=>onLike(post.id)} style={{background:isLiked?PAL.coral+"22":"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,transition:"all .15s"}}>
        <span style={{fontSize:18}}>{isLiked?"❤️":"🤍"}</span>
        <span style={{fontSize:13,fontWeight:700,color:isLiked?PAL.coral:PAL.gray}}>{post.likes||0}</span>
      </button>
      <button onClick={()=>{setShowCom(v=>!v);if(!showCom)chargerComments();}} style={{background:showCom?PAL.sky+"22":"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,transition:"all .15s"}}>
        <span style={{fontSize:18}}>💬</span>
        <span style={{fontSize:13,fontWeight:700,color:PAL.gray}}>{localComments.length}</span>
      </button>
    </div>
    {showCom&&<div style={{borderTop:`1px solid ${PAL.navyLL}`,padding:"14px 18px"}}>
      {localComments.map((c,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:PAL.navyLL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👤</div>
        <div style={{flex:1,background:PAL.navy,borderRadius:10,padding:"8px 12px"}}>
          <div style={{fontSize:11,fontWeight:700,color:PAL.grass,marginBottom:2}}>{c.auteur}</div>
          <div style={{fontSize:13,color:PAL.offW}}>{c.txt}</div>
        </div>
      </div>))}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:PAL.grass+"22",border:`1px solid ${PAL.grass}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{p.relation?.includes("mere")?"👩":"👨"}</div>
        <input style={{flex:1,background:PAL.navy,border:`1.5px solid ${PAL.navyLL}`,borderRadius:10,color:PAL.white,padding:"8px 12px",fontSize:13,fontFamily:"inherit",outline:"none"}} value={commentaire[post.id]||""} onChange={e=>setCommentaire(prev=>({...prev,[post.id]:e.target.value}))} placeholder="Ajouter un commentaire..." onKeyDown={e=>e.key==="Enter"&&envoyerComment()}/>
        <button onClick={envoyerComment} style={{background:PAL.sky,color:"#fff",border:"none",borderRadius:10,padding:"8px 14px",cursor:"pointer",fontSize:14,fontFamily:"'Fredoka One', cursive"}}>Envoyer</button>
      </div>
    </div>}
  </div>);
}

function CommunauteTab({p,PAL,Card,CH,ST}){
  const [posts,setPosts]=useState([]);
  const [comments,setComments]=useState({});
  const [commentaire,setCommentaire]=useState({});
  const [liked,setLiked]=useState({});
  const [filtre,setFiltre]=useState("tous");
  const [loading,setLoading]=useState(true);

  // Charger les posts depuis Supabase
  useEffect(()=>{
    chargerPosts();
  },[]);

  async function chargerPosts(){
    setLoading(true);
    try {
      const {data,error}=await supabase.from("duosport_posts").select("*").order("created_at",{ascending:false});
      if(!error&&data) setPosts(data);
    } catch(e){}
    setLoading(false);
  }

  async function chargerComments(postId){
    try {
      const {data,error}=await supabase.from("duosport_comments").select("*").eq("post_id",String(postId)).order("created_at",{ascending:true});
      if(!error&&data) setComments(prev=>({...prev,[postId]:data}));
    } catch(e){}
  }

  async function liker(id){
    const isLiked=liked[id];
    setLiked(prev=>({...prev,[id]:!prev[id]}));
    setPosts(prev=>prev.map(post=>post.id===id?{...post,likes:(post.likes||0)+(isLiked?-1:1)}:post));
    try {
      const post=posts.find(po=>po.id===id);
      await supabase.from("duosport_posts").update({likes:(post.likes||0)+(isLiked?-1:1)}).eq("id",id);
    } catch(e){}
  }

  async function commenter(postId){
    const txt=commentaire[postId];
    if(!txt||!txt.trim())return;
    const auteur=`${p.parentPrenom||"Vous"} & ${p.enfantPrenom||"Enfant"}`;
    try {
      await supabase.from("duosport_comments").insert({post_id:String(postId),auteur,txt});
      setCommentaire(prev=>({...prev,[postId]:""}));
      chargerComments(postId);
    } catch(e){}
  }

  const filtres=[{id:"tous",icon:"🌍",label:"Tous"},{id:"course",icon:"🏃",label:"Course"},{id:"velo",icon:"🚴",label:"Vélo"},{id:"marche",icon:"🚶",label:"Marche"}];
  const postsFiltres=filtre==="tous"?posts:posts.filter(po=>po.activite===filtre);

  return(<div>
    <ST icon="🌍" title="Communauté" sub="Les sorties de la famille DuoSport" col={PAL.sky}/>

    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
      {[{icon:"👨‍👩‍👦",val:posts.length>0?`${posts.length}`:"0",lbl:"Sorties",col:PAL.grass},{icon:"🏃",val:"DuoSport",lbl:"Communauté",col:PAL.sky},{icon:"📍",val:"France",lbl:"Réseau",col:PAL.sun}].map((s,i)=>(
        <div key={i} style={{background:PAL.navyL,border:`1.5px solid ${s.col}33`,borderRadius:14,padding:"14px",textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
          <div style={{fontFamily:"'Fredoka One', cursive",fontSize:20,color:s.col}}>{s.val}</div>
          <div style={{fontSize:10,color:PAL.gray,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.lbl}</div>
        </div>
      ))}
    </div>

    <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
      {filtres.map(f=>(<button key={f.id} onClick={()=>setFiltre(f.id)} style={{background:filtre===f.id?PAL.sky:PAL.navyL,border:`1.5px solid ${filtre===f.id?PAL.sky:PAL.navyLL}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",color:filtre===f.id?"#fff":PAL.gray,fontSize:12,fontWeight:600,fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6,transition:"all .15s"}}>{f.icon} {f.label}</button>))}
    </div>

    {loading&&<div style={{textAlign:"center",padding:"40px 20px",color:PAL.gray}}><div style={{fontSize:32,marginBottom:8}}>⏳</div><div>Chargement des sorties...</div></div>}

    {!loading&&postsFiltres.map(post=>(
      <PostCard key={post.id} post={post} p={p} PAL={PAL}
        onLike={liker} isLiked={!!liked[post.id]}
        commentaire={commentaire} setCommentaire={setCommentaire}
      />
    ))}

    {!loading&&postsFiltres.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:PAL.gray}}><div style={{fontSize:40,marginBottom:12}}>🏃</div><div>Aucune sortie pour le moment. Soyez le premier !</div></div>}

    <div style={{background:`linear-gradient(135deg,${PAL.sky}18,${PAL.grass}18)`,border:`1.5px solid ${PAL.sky}44`,borderRadius:16,padding:"18px",textAlign:"center",marginTop:8}}>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:PAL.white,marginBottom:6}}>🌍 Rejoignez la communauté !</div>
      <div style={{color:PAL.gray,fontSize:13}}>Partagez vos sorties, encouragez les autres familles. Ensemble on va plus loin !</div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════
// NUTRITION TAB
// ═══════════════════════════════════════════════════════════
const QP=[{id:"poulet",icon:"🍗",l:"Poulet"},{id:"boeuf",icon:"🥩",l:"Bœuf"},{id:"poisson",icon:"🐟",l:"Poisson"},{id:"oeufs",icon:"🥚",l:"Œufs"},{id:"crevettes",icon:"🦐",l:"Crevettes"},{id:"tofu",icon:"🫘",l:"Tofu/Légum."},{id:"jambon",icon:"🍖",l:"Jambon"},{id:"thon",icon:"🐠",l:"Thon"}];
const QF=[{id:"riz",icon:"🍚",l:"Riz"},{id:"pates",icon:"🍝",l:"Pâtes"},{id:"pommes",icon:"🥔",l:"Pommes de terre"},{id:"quinoa",icon:"🌾",l:"Quinoa"},{id:"pain",icon:"🍞",l:"Pain"},{id:"lentilles",icon:"🫘",l:"Lentilles"},{id:"couscous",icon:"🫙",l:"Couscous"},{id:"patate_douce",icon:"🍠",l:"Patate douce"}];
const QL=[{id:"courgette",icon:"🥒",l:"Courgette"},{id:"tomate",icon:"🍅",l:"Tomate"},{id:"poivron",icon:"🫑",l:"Poivron"},{id:"carotte",icon:"🥕",l:"Carotte"},{id:"brocoli",icon:"🥦",l:"Brocoli"},{id:"epinards",icon:"🌿",l:"Épinards"},{id:"champignon",icon:"🍄",l:"Champignons"},{id:"aubergine",icon:"🍆",l:"Aubergine"},{id:"salade",icon:"🥗",l:"Salade"},{id:"haricots",icon:"🫘",l:"Haricots verts"}];
const QC=[{id:"sans_gluten",icon:"🚫",l:"Sans gluten"},{id:"vegetarien",icon:"🌱",l:"Végétarien"},{id:"budget",icon:"💶",l:"Petit budget"},{id:"rapide",icon:"⚡",l:"Max 15 min"},{id:"enfants",icon:"👶",l:"Mangé aussi par les enfants"},{id:"aucune",icon:"✅",l:"Aucune contrainte"}];
const QT=[{id:"rapide",icon:"⚡",l:"< 15 min"},{id:"moyen",icon:"🍳",l:"15-30 min"},{id:"passion",icon:"👨‍🍳",l:"+ de 30 min"}];

function MacroBar({label,val,max,col}){
  return(<div style={{marginBottom:6}}>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:P.gray,marginBottom:3}}><span>{label}</span><span style={{color:col}}>{val}g</span></div>
    <div style={{height:6,background:P.navyLL,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:col,width:`${Math.min(100,(val/max)*100)}%`,borderRadius:3}}/></div>
  </div>);
}

// Instructions de préparation par type de plat
const PREP_INSTRUCTIONS={
  "poulet":[
    "Couper le poulet en morceaux ou lamelles selon la recette.",
    "Faire chauffer un filet d'huile dans une poêle à feu moyen-vif.",
    "Faire dorer le poulet 5-6 min de chaque côté jusqu'à belle coloration.",
    "Ajouter les légumes et cuire 5 min supplémentaires.",
    "Assaisonner sel, poivre, herbes selon le goût. Servir chaud."
  ],
  "boeuf":[
    "Sortir la viande du réfrigérateur 15 min avant cuisson.",
    "Faire chauffer la poêle à feu vif avec un filet d'huile.",
    "Saisir le bœuf 2-3 min de chaque côté pour une cuisson rosée.",
    "Laisser reposer 2 min avant de couper.",
    "Accompagner avec les légumes et féculents choisis."
  ],
  "poisson":[
    "Sécher le poisson avec du papier absorbant.",
    "Huiler légèrement le poisson et assaisonner sel, poivre, citron.",
    "Cuire au four 180°C pendant 15-20 min ou à la poêle 4 min/côté.",
    "Vérifier la cuisson : la chair doit se détacher facilement.",
    "Servir immédiatement avec les accompagnements."
  ],
  "oeufs":[
    "Casser les œufs dans un bol et battre légèrement.",
    "Assaisonner sel, poivre et ajouter les légumes hachés.",
    "Faire chauffer une poêle huilée à feu moyen.",
    "Verser les œufs et cuire selon la texture souhaitée.",
    "Servir chaud avec une tranche de pain."
  ],
  "default":[
    "Préparer et laver tous les ingrédients.",
    "Cuire les féculents selon le paquet (riz: 15 min, pâtes: 8-10 min).",
    "Faire revenir les légumes à la poêle 5-7 min avec un filet d'huile.",
    "Cuire la protéine choisie séparément selon sa nature.",
    "Assembler dans une assiette, assaisonner et servir."
  ]
};

function getPrepInstructions(repas){
  for(const key of Object.keys(PREP_INSTRUCTIONS)){
    if(key!=="default"&&repas.proteines?.includes(key)) return PREP_INSTRUCTIONS[key];
  }
  return PREP_INSTRUCTIONS.default;
}

function RepasCard({repas,moment}){
  const [open,setOpen]=useState(false);
  const mCol=moment==="midi"?P.sun:P.purple;
  const mIcon=moment==="midi"?"☀️":"🌙";
  return(<div style={{background:P.navyL,border:`1.5px solid ${mCol}33`,borderRadius:14,marginBottom:10,overflow:"hidden"}}>
    <div onClick={()=>setOpen(o=>!o)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
          <span style={{fontSize:14}}>{mIcon}</span>
          <span style={{fontWeight:700,fontSize:14,color:P.white}}>{repas.nom}</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{background:P.coral+"22",color:P.coral,fontSize:10,padding:"2px 7px",borderRadius:4}}>{repas.p}g protéines</span>
          <span style={{background:P.sky+"22",color:P.sky,fontSize:10,padding:"2px 7px",borderRadius:4}}>{repas.g}g glucides</span>
          <span style={{background:P.sun+"22",color:P.sun,fontSize:10,padding:"2px 7px",borderRadius:4}}>⏱️ {repas.tps} min</span>
          <span style={{background:P.grass+"22",color:P.grass,fontSize:10,padding:"2px 7px",borderRadius:4}}>🔥 {repas.cal} kcal</span>
        </div>
      </div>
      <span style={{color:P.gray,fontSize:16}}>{open?"▲":"▼"}</span>
    </div>
    {open&&<div style={{padding:"0 16px 14px"}}>
      <MacroBar label="Protéines" val={repas.p} max={50} col={P.coral}/>
      <MacroBar label="Glucides"  val={repas.g} max={70} col={P.sky}/>
      <MacroBar label="Lipides"   val={repas.l} max={30} col={P.sun}/>
      <div style={{marginTop:12,fontSize:12,color:P.gray,marginBottom:10}}>
        🛒 <strong style={{color:P.offW}}>Ingrédients :</strong> {[...repas.proteines,...repas.feculents,...repas.legumes].join(", ")}
      </div>
      <div style={{fontSize:11,color:P.grass,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>📋 Préparation</div>
      {getPrepInstructions(repas).map((step,i)=>(
        <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:P.grass+"33",border:`1px solid ${P.grass}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P.grass,flexShrink:0,marginTop:1}}>{i+1}</div>
          <div style={{fontSize:13,color:P.offW,lineHeight:1.5}}>{step}</div>
        </div>
      ))}
    </div>}
  </div>);
}

function NutritionTab({objParent}){
  const [prot,setProt]=useState([]);
  const [fec,setFec]=useState([]);
  const [leg,setLeg]=useState([]);
  const [cont,setCont]=useState([]);
  const [tps,setTps]=useState("moyen");
  const [etape,setEtape]=useState(1);
  const [repasMidi,setRepasMidi]=useState([]);
  const [repasSoir,setRepasSoir]=useState([]);

  function tog(arr,setArr,val){setArr(prev=>prev.includes(val)?prev.filter(x=>x!==val):[...prev,val]);}
  const pret=prot.length>0&&fec.length>0&&leg.length>0;

  function generer(){
    const objs=objParent.length>0?objParent:["maintenance"];
    const rm=selectionnerRepas(prot,fec,leg,cont,tps,objs,"midi",5);
    const rs=selectionnerRepas(prot,fec,leg,cont,tps,objs,"soir",5);
    setRepasMidi(rm); setRepasSoir(rs); setEtape(2);
  }

  const cs=(active,col)=>({background:active?col+"33":P.navyLL,border:`2px solid ${active?col:"transparent"}`,borderRadius:12,padding:"9px 12px",cursor:"pointer",color:active?col:P.gray,fontSize:13,fontWeight:600,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s",boxShadow:active?`0 2px 12px ${col}33`:"none"});

  return(<div>
    <ST icon="🥗" title="Nutrition" sub="Questionnaire goûts → repas personnalisés" col={P.grass}/>

    {etape===1&&(<>
      <Card col={P.coral}><CH icon="🍗" title="Vos protéines préférées" sub="Plusieurs choix possibles" col={P.coral}/>
        <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {QP.map(q=>(<button key={q.id} onClick={()=>tog(prot,setProt,q.id)} style={cs(prot.includes(q.id),P.coral)}><span style={{fontSize:22}}>{q.icon}</span><span style={{fontSize:11}}>{q.l}</span></button>))}
        </div>
      </Card>

      <Card col={P.sun}><CH icon="🍚" title="Vos féculents préférés" sub="Plusieurs choix possibles" col={P.sun}/>
        <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {QF.map(q=>(<button key={q.id} onClick={()=>tog(fec,setFec,q.id)} style={cs(fec.includes(q.id),P.sun)}><span style={{fontSize:22}}>{q.icon}</span><span style={{fontSize:11}}>{q.l}</span></button>))}
        </div>
      </Card>

      <Card col={P.grass}><CH icon="🥦" title="Vos légumes préférés" sub="Plusieurs choix possibles" col={P.grass}/>
        <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {QL.map(q=>(<button key={q.id} onClick={()=>tog(leg,setLeg,q.id)} style={cs(leg.includes(q.id),P.grass)}><span style={{fontSize:22}}>{q.icon}</span><span style={{fontSize:10}}>{q.l}</span></button>))}
        </div>
      </Card>

      <Card col={P.purple}><CH icon="⚙️" title="Contraintes & temps de préparation" sub="Optionnel" col={P.purple}/>
        <div style={{padding:"16px 18px"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
            {QC.map(q=>(<Toggle key={q.id} icon={q.icon} label={q.l} col={P.purple} active={cont.includes(q.id)} onClick={()=>tog(cont,setCont,q.id)}/>))}
          </div>
          <div style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Temps de préparation</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {QT.map(q=>(<button key={q.id} onClick={()=>setTps(q.id)} style={cs(tps===q.id,P.purple)}><span style={{fontSize:22}}>{q.icon}</span><span style={{fontSize:12,fontWeight:700}}>{q.l}</span></button>))}
          </div>
        </div>
      </Card>

      <button onClick={generer} disabled={!pret} style={{width:"100%",background:pret?`linear-gradient(135deg,${P.grass},${P.sky})`:P.navyLL,color:pret?"#fff":P.gray,border:"none",borderRadius:16,padding:"18px",fontSize:17,fontFamily:"'Fredoka One', cursive",cursor:pret?"pointer":"default",boxShadow:pret?`0 6px 24px ${P.grass}44`:"none",transition:"all .2s"}}>
        {pret?"🍽️ Générer mes 10 repas (5 midi + 5 soir) !":"Choisissez vos protéines, féculents et légumes d'abord"}
      </button>
      {!pret&&<div style={{textAlign:"center",color:P.gray,fontSize:12,marginTop:8}}>{prot.length===0?"⬆️ Choisissez au moins une protéine · ":""}{fec.length===0?"un féculent · ":""}{leg.length===0?"un légume":""}</div>}
    </>)}

    {etape===2&&(<div>
      <button onClick={()=>{setEtape(1);setRepasMidi([]);setRepasSoir([]);}} style={{background:"none",border:`1.5px solid ${P.navyLL}`,borderRadius:10,padding:"9px 16px",color:P.gray,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>
        ← Modifier mes goûts
      </button>

      {repasMidi.length>0&&(<>
        <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:P.sun,marginBottom:10}}>☀️ Repas du midi</div>
        {repasMidi.map(r=><RepasCard key={r.id} repas={r} moment="midi"/>)}
      </>)}

      {repasSoir.length>0&&(<>
        <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:P.purple,marginBottom:10,marginTop:20}}>🌙 Repas du soir</div>
        {repasSoir.map(r=><RepasCard key={r.id} repas={r} moment="soir"/>)}
      </>)}

      {repasMidi.length===0&&repasSoir.length===0&&(
        <div style={{background:P.coral+"18",border:`1px solid ${P.coral}44`,borderRadius:12,padding:"16px 18px",color:P.coral}}>
          ⚠️ Aucun repas trouvé avec ces critères. Essayez de sélectionner plus d'aliments ou de réduire les contraintes.
        </div>
      )}

      <div style={{background:P.sky+"18",border:`1.5px solid ${P.sky}44`,borderRadius:14,padding:"14px 18px",marginTop:16}}>
        <div style={{color:P.sky,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>💧 Hydratation</div>
        <div style={{color:P.gray,fontSize:13,lineHeight:1.6}}>Objectif quotidien : <strong style={{color:P.white}}>2 à 2.5L d'eau</strong>. Avant séance : 500ml. Après : 500ml min.</div>
      </div>
    </div>)}
  </div>);
}

// ═══════════════════════════════════════════════════════════
// EXERCICE CARD — pour l'affichage programme
// ═══════════════════════════════════════════════════════════
function ExCard({ex,idx,col}){
  const [open,setOpen]=useState(false);
  const tagColors={
    "ÉCHO":"#FFD93D","RETOUR":"#A78BFA","DUO":"#38C9F0",
    "FUN":"#3DDC84","DÉFI":"#FF9F43","PROGRESSION":"#FF6B6B",
  };
  const tagCol=ex.tag?tagColors[ex.tag]||col:col;
  const isEcho=ex.tag==="ÉCHO";
  const isRetour=ex.tag==="RETOUR";
  return(
    <div style={{background:P.navyL,border:`1.5px solid ${isEcho?"#FFD93D33":isRetour?"#A78BFA33":`${col}33`}`,borderRadius:14,marginBottom:8,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:tagCol+"22",border:`1px solid ${tagCol}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:tagCol,flexShrink:0}}>{idx+1}</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,color:P.white}}>{ex.nom}</div>
          <div style={{fontSize:11,color:P.gray,marginTop:1}}>{ex.reps}{ex.recup?` · Récup ${ex.recup}`:""}</div>
        </div>
        {ex.tag&&<div style={{background:tagCol+"22",border:`1px solid ${tagCol}44`,borderRadius:6,padding:"2px 8px",fontSize:9,color:tagCol,fontWeight:700,letterSpacing:1}}>{ex.tag}</div>}
        <span style={{color:P.gray,fontSize:12}}>{open?"▲":"▼"}</span>
      </div>
      {open&&<div style={{padding:"0 16px 14px",borderTop:`1px solid ${P.navyLL}`}}>
        <div style={{fontSize:13,color:P.offW,lineHeight:1.6,paddingTop:10}}>{ex.desc}</div>
        {ex.adapte&&<div style={{marginTop:8,background:P.coral+"18",border:`1px solid ${P.coral}33`,borderRadius:8,padding:"6px 10px",fontSize:11,color:P.coral}}>{ex.adapte}</div>}
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP PRINCIPALE
// ═══════════════════════════════════════════════════════════
export default function FitFamilyApp(){
  const [tab,setTab]=useState("profil");
  const [semCourante,setSemCourante]=useState(0);
  const [semaines,setSemaines]=useState([]);
  const [prog,setProg]=useState(false);
  const [p,setP]=useState({
    relation:"pere_fils",
    enfantPrenom:"",enfantAge:"",enfantSexe:"garcon",enfantPoids:"",enfantTaille:"",
    enfantNaisJour:"",enfantNaisMois:"",enfantNaisAnnee:"",
    enfantObjectifs:["vitesse"],enfantPathos:[],sport:"collectif",
    parentPrenom:"",parentAge:"",parentPoids:"",parentTaille:"",
    parentNaisJour:"",parentNaisMois:"",parentNaisAnnee:"",
    parentObjectifs:["poids"],parentPathos:[],
    style:"mixte",duree:8,
  });

  function set(k,v){setP(prev=>({...prev,[k]:v}));}
  function togArr(key,val){setP(prev=>{const a=prev[key];if(a.includes(val))return a.length<=1?prev:{...prev,[key]:a.filter(x=>x!==val)};return{...prev,[key]:[...a,val]};});}
  function togPatho(who,val){const k=who==="enfant"?"enfantPathos":"parentPathos";setP(prev=>({...prev,[k]:prev[k].includes(val)?prev[k].filter(x=>x!==val):[...prev[k],val]}));}

  const ageRules=p.enfantAge?getAgeRules(parseInt(p.enfantAge)):null;
  const imcE=calcIMC(p.enfantPoids,p.enfantTaille);
  const imcP=calcIMC(p.parentPoids,p.parentTaille);
  const rel=RELATIONS.find(r=>r.id===p.relation)||RELATIONS[0];
  const sportObj=SPORTS[p.sport];
  const semComp=semaines.filter(s=>s.complete).length;
  const tropheesOk=TROPHEES.filter(t=>t.s<=semComp&&t.s<=p.duree);

  const progRef=useRef(null);

  function genProg(){
    const rules=ageRules||getAgeRules(8);
    const sw=Array.from({length:p.duree},(_,i)=>({
      semaine:i+1,
      ...genProgramme(p.sport,p.enfantObjectifs,p.style,p.enfantPathos,p.parentPathos,rules,i+1,p.duree,p.relation),
      complete:false,
    }));
    setSemaines(sw);setProg(true);setSemCourante(0);setTab("programme");
    setTimeout(()=>{window.scrollTo({top:0,behavior:"smooth"});},100);
  }

  function marquer(i){setSemaines(prev=>prev.map((s,j)=>j===i?{...s,complete:true}:s));}

  const BOTTOM_TABS=[
    {id:"programme", label:"Entraîner", icon:"🎯"},
    {id:"libre",     label:"Libre",     icon:"⏱️"},
    {id:"communaute",label:"Communauté",icon:"🌍"},
  ];

  const BURGER_ITEMS=[
    {id:"profil",    label:"👤 Profils"},
    {id:"solo",      label:"💪 Séance Solo"},
    {id:"nutrition", label:"🥗 Nutrition"},
    {id:"trophees",  label:`🏆 Trophées${tropheesOk.length>0?` (${tropheesOk.length})`:""}`},
  ];

  const [burgerOpen,setBurgerOpen]=useState(false);

  return(<div style={{background:P.navy,minHeight:"100vh",color:P.white,fontFamily:"'DM Sans',sans-serif"}}>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet"/>

    {/* HERO */}
    <div style={{background:`linear-gradient(135deg,#1A1F3C,#242947,#1A1F3C)`,padding:"28px 20px 22px",textAlign:"center",borderBottom:`2px solid ${P.navyLL}`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-40,left:-40,width:160,height:160,borderRadius:"50%",background:P.grass+"18",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:-20,right:-30,width:120,height:120,borderRadius:"50%",background:P.sky+"18",pointerEvents:"none"}}/>
      <div style={{fontSize:10,letterSpacing:4,color:P.grass,marginBottom:8,textTransform:"uppercase"}}>Application entraînement</div>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:54,lineHeight:1,letterSpacing:2}}>
        <span style={{color:P.sun}}>FIT</span><span style={{color:P.grass}}>FAMILY</span><span style={{fontSize:36}}> {rel.icons}</span>
      </div>
      <div style={{color:P.gray,fontSize:12,marginTop:8,letterSpacing:1}}>
        {prog?`${rel.label} · ${p.duree} semaines · ${sportObj?.label}`:"Entraînement · Nutrition · Trophées"}
      </div>
      {prog&&<div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16,flexWrap:"wrap"}}>
        {[{v:`${semComp}/${p.duree}`,l:"Semaines",c:P.sun},{v:tropheesOk.length,l:"Trophées",c:P.coral},{v:`${Math.round((semComp/Math.max(p.duree,1))*100)}%`,l:"Progression",c:P.grass}].map((s,i)=>(
          <div key={i} style={{textAlign:"center"}}><div style={{fontFamily:"'Fredoka One', cursive",fontSize:30,color:s.c,lineHeight:1}}>{s.v}</div><div style={{fontSize:9,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{s.l}</div></div>
        ))}
      </div>}
    </div>
    {prog&&<div style={{height:4,background:P.navyLL}}><div style={{height:"100%",background:`linear-gradient(90deg,${P.grass},${P.sky})`,width:`${(semComp/p.duree)*100}%`,transition:"width .4s"}}/></div>}

    {/* BURGER MENU OVERLAY */}
    {burgerOpen&&<div onClick={()=>setBurgerOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.navyL,width:260,minHeight:"100vh",padding:"24px 0",boxShadow:"-4px 0 30px #00000060"}}>
        <div style={{padding:"0 20px 20px",borderBottom:`1px solid ${P.navyLL}`,marginBottom:8}}>
          <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22}}><span style={{color:P.sun}}>FIT</span><span style={{color:P.grass}}>FAMILY</span></div>
          <div style={{color:P.gray,fontSize:12,marginTop:2}}>{rel.icons} {p.enfantPrenom||"Votre duo"}</div>
        </div>
        {BURGER_ITEMS.map(item=>(
          <button key={item.id} onClick={()=>{setTab(item.id);setBurgerOpen(false);}} style={{width:"100%",background:tab===item.id?P.grass+"22":"none",border:"none",padding:"14px 20px",textAlign:"left",color:tab===item.id?P.grass:P.offW,fontFamily:"'Fredoka One', cursive",fontSize:16,cursor:"pointer",display:"block",letterSpacing:.5}}>
            {item.label}
          </button>
        ))}
        <div style={{padding:"20px 20px 0",marginTop:8,borderTop:`1px solid ${P.navyLL}`}}>
          <div style={{fontSize:11,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Progression</div>
          <div style={{height:6,background:P.navyLL,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${P.grass},${P.sky})`,width:`${(semComp/Math.max(p.duree,1))*100}%`,transition:"width .4s",borderRadius:3}}/></div>
          <div style={{fontSize:11,color:P.gray,marginTop:6}}>{semComp}/{p.duree} semaines</div>
        </div>
      </div>
    </div>}

    {/* NAV HEADER */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:P.navyL,borderBottom:`1px solid ${P.navyLL}`,position:"sticky",top:0,zIndex:100}}>
      <button onClick={()=>setBurgerOpen(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"6px",display:"flex",flexDirection:"column",gap:5}}>
        <div style={{width:22,height:2,background:P.offW,borderRadius:1}}/>
        <div style={{width:22,height:2,background:P.offW,borderRadius:1}}/>
        <div style={{width:16,height:2,background:P.offW,borderRadius:1}}/>
      </button>
      <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22}}><span style={{color:P.sun}}>FIT</span><span style={{color:P.grass}}>FAMILY</span></div>
      <div style={{width:34,height:34,borderRadius:"50%",background:P.grass+"22",border:`2px solid ${P.grass}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
        {rel.icons}
      </div>
    </div>

    <div style={{maxWidth:820,margin:"0 auto",padding:"22px 14px 90px"}}>

      {/* PROFILS */}
      {tab==="profil"&&<div>
        <ST icon="🧩" title="Configurez votre duo !" sub="Renseignez les infos pour votre programme personnalisé" col={P.grass}/>

        <Card col={P.sky}><CH icon="👥" title="Votre duo" sub="Qui s'entraîne ensemble ?" col={P.sky}/>
          <div style={{padding:"16px 18px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {RELATIONS.map(r=>(<Chip key={r.id} icon={r.icons} label={r.label} col={r.col} active={p.relation===r.id} onClick={()=>set("relation",r.id)}/>))}
          </div>
        </Card>

        <Card col={P.grass}><CH icon="🧒" title={`L'enfant ${rel.icons}`} sub="Profil, sport et objectifs" col={P.grass}/>
          <div style={{padding:"16px 18px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Prénom</label><input style={INP} value={p.enfantPrenom} onChange={e=>set("enfantPrenom",e.target.value)} placeholder="Prénom"/></div>
              <div><label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Sexe</label><select style={INP} value={p.enfantSexe} onChange={e=>set("enfantSexe",e.target.value)}><option value="garcon">Garçon</option><option value="fille">Fille</option></select></div>
            </div>
            {/* Date naissance enfant → âge auto */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>📅 Date de naissance</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <select style={INP} value={p.enfantNaisJour||""} onChange={e=>{const j=e.target.value;set("enfantNaisJour",j);if(j&&p.enfantNaisMois&&p.enfantNaisAnnee){const age=calcAge(j,p.enfantNaisMois,p.enfantNaisAnnee);set("enfantAge",String(age));}}}>
                  <option value="">Jour</option>
                  {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <select style={INP} value={p.enfantNaisMois||""} onChange={e=>{const m=e.target.value;set("enfantNaisMois",m);if(p.enfantNaisJour&&m&&p.enfantNaisAnnee){const age=calcAge(p.enfantNaisJour,m,p.enfantNaisAnnee);set("enfantAge",String(age));}}}>
                  <option value="">Mois</option>
                  {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <select style={INP} value={p.enfantNaisAnnee||""} onChange={e=>{const a=e.target.value;set("enfantNaisAnnee",a);if(p.enfantNaisJour&&p.enfantNaisMois&&a){const age=calcAge(p.enfantNaisJour,p.enfantNaisMois,a);set("enfantAge",String(age));}}}>
                  <option value="">Année</option>
                  {Array.from({length:18},(_,i)=>new Date().getFullYear()-4-i).map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {p.enfantAge&&<div style={{marginTop:6,background:P.grass+"22",border:`1px solid ${P.grass}44`,borderRadius:8,padding:"6px 12px",fontSize:12,color:P.grass}}>✓ Âge calculé automatiquement : <strong>{p.enfantAge} ans</strong></div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Poids (kg)</label>
                <select style={INP} value={p.enfantPoids} onChange={e=>set("enfantPoids",e.target.value)}>
                  <option value="">Sélectionner</option>
                  {Array.from({length:71},(_,i)=>i+20).map(v=><option key={v} value={v}>{v} kg</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Taille (cm)</label>
                <select style={INP} value={p.enfantTaille} onChange={e=>set("enfantTaille",e.target.value)}>
                  <option value="">Sélectionner</option>
                  {Array.from({length:101},(_,i)=>i+100).map(v=><option key={v} value={v}>{v} cm</option>)}
                </select>
              </div>
            </div>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:8,display:"block"}}>Sport pratiqué</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
              {Object.entries(SPORTS).map(([k,v])=>(<Chip key={k} icon={v.icon} label={v.label} desc={v.ex} col={v.col} active={p.sport===k} onClick={()=>set("sport",k)}/>))}
            </div>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>🎯 Objectifs <span style={{color:P.grass}}>(plusieurs choix !)</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {OBJ_ENFANT.map(o=>(<Toggle key={o.id} icon={o.icon} label={o.label} col={o.col} active={p.enfantObjectifs.includes(o.id)} onClick={()=>togArr("enfantObjectifs",o.id)}/>))}
            </div>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>⚠️ Santé / Contraintes</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:12}}>
              {PATHO_E.map(ph=>(<Toggle key={ph} icon={ph==="Aucune"?"✅":"⚠️"} label={ph} col={ph==="Aucune"?P.grass:P.coral} active={p.enfantPathos.includes(ph)} onClick={()=>togPatho("enfant",ph)}/>))}
            </div>
            {imcE&&<div style={{background:imcE.col+"18",border:`1px solid ${imcE.col}44`,borderRadius:12,padding:"10px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,color:P.gray,letterSpacing:1}}>IMC ENFANT</div><div style={{fontSize:11,color:P.gray}}>{imcE.cat}</div></div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:32,color:imcE.col}}>{imcE.val}</div></div>}
            {ageRules&&<div style={{background:ageRules.col+"18",border:`1px solid ${ageRules.col}44`,borderRadius:12,padding:"12px 16px"}}><div style={{color:ageRules.col,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🧬 {ageRules.label}</div><div style={{fontSize:13,color:P.offW}}>{ageRules.note}</div><div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}><span style={{background:(ageRules.fractionne?P.grass:P.coral)+"22",color:ageRules.fractionne?P.grass:P.coral,fontSize:10,padding:"2px 8px",borderRadius:5}}>{ageRules.fractionne?"✓ Fractionné OK":"✗ Pas de fractionné"}</span><span style={{background:P.sun+"22",color:P.sun,fontSize:10,padding:"2px 8px",borderRadius:5}}>Sprints max {ageRules.sprintMax}m</span></div></div>}
          </div>
        </Card>

        <Card col={P.sun}><CH icon="🧑" title="Le parent" sub="Profil et objectifs" col={P.sun}/>
          <div style={{padding:"16px 18px"}}>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Prénom du parent</label>
              <input style={INP} value={p.parentPrenom} onChange={e=>set("parentPrenom",e.target.value)} placeholder="Votre prénom"/>
            </div>
            {/* Date naissance parent → âge auto */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>📅 Date de naissance</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <select style={INP} value={p.parentNaisJour||""} onChange={e=>{const j=e.target.value;set("parentNaisJour",j);if(j&&p.parentNaisMois&&p.parentNaisAnnee){set("parentAge",String(calcAge(j,p.parentNaisMois,p.parentNaisAnnee)));}}}>
                  <option value="">Jour</option>
                  {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <select style={INP} value={p.parentNaisMois||""} onChange={e=>{const m=e.target.value;set("parentNaisMois",m);if(p.parentNaisJour&&m&&p.parentNaisAnnee){set("parentAge",String(calcAge(p.parentNaisJour,m,p.parentNaisAnnee)));}}}>
                  <option value="">Mois</option>
                  {["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"].map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
                <select style={INP} value={p.parentNaisAnnee||""} onChange={e=>{const a=e.target.value;set("parentNaisAnnee",a);if(p.parentNaisJour&&p.parentNaisMois&&a){set("parentAge",String(calcAge(p.parentNaisJour,p.parentNaisMois,a)));}}}>
                  <option value="">Année</option>
                  {Array.from({length:50},(_,i)=>new Date().getFullYear()-18-i).map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {p.parentAge&&<div style={{marginTop:6,background:P.sun+"22",border:`1px solid ${P.sun}44`,borderRadius:8,padding:"6px 12px",fontSize:12,color:P.sun}}>✓ Âge calculé automatiquement : <strong>{p.parentAge} ans</strong></div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Poids (kg)</label>
                <select style={INP} value={p.parentPoids} onChange={e=>set("parentPoids",e.target.value)}>
                  <option value="">Sélectionner</option>
                  {Array.from({length:101},(_,i)=>i+40).map(v=><option key={v} value={v}>{v} kg</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:5,display:"block"}}>Taille (cm)</label>
                <select style={INP} value={p.parentTaille} onChange={e=>set("parentTaille",e.target.value)}>
                  <option value="">Sélectionner</option>
                  {Array.from({length:61},(_,i)=>i+150).map(v=><option key={v} value={v}>{v} cm</option>)}
                </select>
              </div>
            </div>
            {imcP&&<div style={{background:imcP.col+"18",border:`1px solid ${imcP.col}44`,borderRadius:12,padding:"10px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:10,color:P.gray,letterSpacing:1}}>IMC PARENT</div><div style={{fontSize:11,color:P.gray}}>{imcP.cat}</div></div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:32,color:imcP.col}}>{imcP.val}</div></div>}
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>🎯 Objectifs <span style={{color:P.sun}}>(plusieurs choix !)</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {OBJ_PARENT.map(o=>(<Toggle key={o.id} icon={o.icon} label={o.label} col={o.col} active={p.parentObjectifs.includes(o.id)} onClick={()=>togArr("parentObjectifs",o.id)}/>))}
            </div>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"}}>⚠️ Santé / Contraintes</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {PATHO_P.map(ph=>(<Toggle key={ph} icon={ph==="Aucune"?"✅":"⚠️"} label={ph} col={ph==="Aucune"?P.grass:P.coral} active={p.parentPathos.includes(ph)} onClick={()=>togPatho("parent",ph)}/>))}
            </div>
          </div>
        </Card>

        <Card col={P.purple}><CH icon="📅" title="Votre programme" sub="Durée et style" col={P.purple}/>
          <div style={{padding:"16px 18px"}}>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:8,display:"block"}}>Durée</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
              {DUREES.map(d=>(<Chip key={d.val} icon={d.val+"s"} label={d.label} desc={d.desc} col={d.col} active={p.duree===d.val} onClick={()=>set("duree",d.val)}/>))}
            </div>
            <label style={{fontSize:10,color:P.gray,letterSpacing:1,textTransform:"uppercase",marginBottom:8,display:"block"}}>Style</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {STYLES.map(s=>(<Chip key={s.id} icon={s.icon} label={s.label} desc={s.desc} col={P.purple} active={p.style===s.id} onClick={()=>set("style",s.id)}/>))}
            </div>
          </div>
        </Card>

        <button onClick={genProg} style={{width:"100%",background:`linear-gradient(135deg,${P.grass},${P.sky})`,border:"none",borderRadius:16,padding:"18px 28px",fontSize:18,fontFamily:"'Fredoka One', cursive",color:"#fff",cursor:"pointer",letterSpacing:1,boxShadow:`0 6px 30px ${P.grass}55`}}>
          🚀 Générer mon programme {p.duree} semaines !
        </button>
      </div>}

      {/* PROGRAMME */}
      {tab==="programme"&&<div>
        <ST icon={sportObj?.icon||"🎯"} title="Programme Duo !" sub={`${sportObj?.label} · ${p.duree} semaines`} col={P.grass}/>
        {!prog?(<div style={{textAlign:"center",padding:40,color:P.gray}}><div style={{fontSize:48,marginBottom:12}}>⚙️</div><div style={{fontSize:15,marginBottom:20}}>Configurez d'abord vos profils !</div><button onClick={()=>setTab("profil")} style={{background:P.grass,color:"#fff",border:"none",borderRadius:12,padding:"13px 28px",fontSize:15,fontFamily:"'Fredoka One', cursive",cursor:"pointer"}}>Configurer →</button></div>):(<>
          {/* Résumé duo */}
          <div style={{background:P.navyL,border:`1.5px solid ${P.navyLL}`,borderRadius:14,padding:"12px 18px",marginBottom:18,display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            <span style={{fontSize:24}}>{rel.icons}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Fredoka One', cursive",fontSize:16,color:P.white}}>{p.parentPrenom||"Parent"} & {p.enfantPrenom||"Enfant"} · {sportObj?.label}</div>
              <div style={{color:P.gray,fontSize:11,marginTop:2}}>Bloc {semaines[semCourante]?.bloc||1}/4 · Semaine {semCourante+1}/{p.duree}</div>
            </div>
          </div>

          {/* Navigation semaines */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:18}}>
            {semaines.map((s,i)=>(<button key={i} onClick={()=>setSemCourante(i)} style={{background:semCourante===i?P.grass:s.complete?P.grass+"22":P.navyLL,color:semCourante===i?"#fff":s.complete?P.grass:P.gray,border:`2px solid ${semCourante===i?P.grass:s.complete?P.grass+"55":"transparent"}`,borderRadius:10,padding:"7px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>S{i+1}{s.complete?" ✓":""}</button>))}
          </div>

          {/* SEMAINE COURANTE — 2 séances uniquement */}
          {semaines[semCourante]&&<>
            <div style={{background:P.navyL,border:`1.5px solid ${P.navyLL}`,borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:P.grass}}>Semaine {semCourante+1} 💪</div>
                <div style={{color:P.gray,fontSize:12,marginTop:2}}>Bloc {semaines[semCourante].bloc}/4 · {semCourante<Math.ceil(p.duree/2)?"Phase construction":"Phase intensification 🔥"}</div>
              </div>
              {!semaines[semCourante].complete?
                <button onClick={()=>marquer(semCourante)} style={{background:P.grass,color:"#fff",border:"none",borderRadius:12,padding:"11px 18px",fontSize:14,fontFamily:"'Fredoka One', cursive",cursor:"pointer",boxShadow:`0 4px 16px ${P.grass}44`}}>✅ Semaine terminée !</button>:
                <div style={{fontFamily:"'Fredoka One', cursive",fontSize:22,color:P.grass}}>🏅 Validée !</div>
              }
            </div>

            {/* SÉANCE A */}
            <div style={{background:P.sky+"18",border:`1.5px solid ${P.sky}44`,borderRadius:14,padding:"12px 16px",marginBottom:10}}>
              <div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:P.sky,marginBottom:4}}>🏃 Séance A — Cardio & Technique</div>
              <div style={{fontSize:11,color:P.gray}}>Endurance · Coordination · Jeux</div>
            </div>
            {semaines[semCourante].seanceA?.map((ex,i)=><ExCard key={i} ex={ex} idx={i} col={P.sky}/>)}

            <div style={{height:16}}/>

            {/* SÉANCE B */}
            <div style={{background:P.coral+"18",border:`1.5px solid ${P.coral}44`,borderRadius:14,padding:"12px 16px",marginBottom:10}}>
              <div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:P.coral,marginBottom:4}}>⚡ Séance B — Vivacité & Force</div>
              <div style={{fontSize:11,color:P.gray}}>Explosivité · Renforcement · Défis</div>
            </div>
            {semaines[semCourante].seanceB?.map((ex,i)=><ExCard key={i} ex={ex} idx={i} col={P.coral}/>)}

            <div style={{height:20}}/>

            {/* Navigation semaine suivante */}
            <div style={{display:"flex",gap:10}}>
              {semCourante>0&&<button onClick={()=>setSemCourante(s=>s-1)} style={{flex:1,background:P.navyL,border:`1px solid ${P.navyLL}`,borderRadius:12,padding:"12px",color:P.gray,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>← Semaine {semCourante}</button>}
              {semCourante<semaines.length-1&&<button onClick={()=>setSemCourante(s=>s+1)} style={{flex:1,background:P.grass,border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"'Fredoka One', cursive"}}>Semaine {semCourante+2} →</button>}
            </div>
          </>}
        </>)}
      </div>}

      {/* SOLO */}
      {tab==="solo"&&<div>
        <ST icon="🏃" title="Séance Solo" sub={`Pour ${p.parentPrenom||"le parent"} uniquement · Sans ballon`} col={P.sun}/>
        <div style={{background:P.grass+"18",border:`1.5px solid ${P.grass}44`,borderRadius:14,padding:"14px 18px",marginBottom:20,fontSize:13,color:P.white}}>
          <strong style={{color:P.grass}}>Pourquoi cette séance est clé :</strong> Le fractionné réactive le système neuromusculaire — en 4-6 semaines tu vas sentir la différence sur tes changements de rythme en match. ⚡
          {p.parentPathos.filter(x=>x!=="Aucune").length>0&&<div style={{marginTop:8,color:P.coral,fontSize:12}}>⚠️ Pathologies détectées — consulte un médecin avant de commencer.</div>}
        </div>
        <Card col={P.sun}><CH icon="⚡" title="Bloc 1 — Fractionné" sub="Changements de rythme · Mémoire musculaire" col={P.sun}/>
          <div style={{padding:"16px 18px"}}>
            {[{l:"Mois 1",r:"10 × 30m",d:"Sprint max 30m → marche retour. Départ explosif, travaille tes 5 premiers mètres."},{l:"Mois 2+",r:"12 × 40m + 3 × 200m",d:"Distance augmentée. 3 × 200m à 80% intensité, 2 min récup entre chaque."}].map((b,i)=>(<div key={i} style={{borderBottom:i===0?`1px solid ${P.navyLL}`:"none",paddingBottom:i===0?14:0,paddingTop:i===1?14:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div><div style={{fontWeight:700,fontSize:14,color:P.white}}>Sprint → marche retour <span style={{background:P.sun+"22",color:P.sun,fontSize:10,padding:"2px 7px",borderRadius:5,marginLeft:8}}>{b.l}</span></div><div style={{color:P.gray,fontSize:12,marginTop:3}}>{b.d}</div></div>
                <div style={{background:P.navy,border:`1.5px solid ${P.navyLL}`,borderRadius:8,padding:"6px 11px",fontSize:13,fontFamily:"'Fredoka One', cursive",color:P.white,whiteSpace:"nowrap"}}>{b.r}</div>
              </div>
              {i===0&&<Schema type="sprint"/>}
            </div>))}
          </div>
        </Card>
        <Card col={P.coral}><CH icon="💪" title="Bloc 2 — Circuit" sub="Mois 1 : 3 tours · Mois 2 : 4 tours + élastique" col={P.coral}/>
          <div style={{padding:"16px 18px"}}>
            {[
              {n:"Pompes explosives",d:"Descente contrôlée, poussée explosive",r:"M1:3×15/M2:4×15",a:p.parentPathos.includes("Mal de dos")?"✓ Ne pas creuser le dos":null},
              {n:p.parentPathos.includes("Genoux")?"Squat bulgare (léger)":"Squat bulgare",d:"Pied arrière sur chaise. Excellent pour adducteurs.",r:"3×10/jambe",a:p.parentPathos.includes("Genoux")?"✓ Amplitude réduite":"M2 : + élastique"},
              {n:"Gainage planche",d:"Corps aligné, contracte les fessiers",r:"M1:3×45s/M2:3×60s",a:p.parentPathos.includes("Mal de dos")?"✓ Genoux si besoin":null},
              {n:"Dips sur chaise",d:"Mains derrière, coudes 90°",r:"M1:3×12/M2:4×15"},
              {n:p.parentPathos.includes("Genoux")?"Fentes statiques":"Fentes sautées",d:p.parentPathos.includes("Genoux")?"Fente fixe sans saut":"Fente, saut, changement jambe",r:"M1:3×10/M2:4×12",a:p.parentPathos.includes("Genoux")?"✓ Adapté genoux":null},
              {n:"Gainage latéral",d:"Avant-bras, hanches hautes",r:"3×30s/côté"},
            ].map((ex,i,arr)=>(<div key={i} style={{borderBottom:i<arr.length-1?`1px solid ${P.navyLL}`:"none",padding:"11px 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:P.white}}>{ex.n}</div><div style={{color:P.gray,fontSize:12,marginTop:2}}>{ex.d}</div>{ex.a&&<div style={{color:ex.a.startsWith("✓")?P.grass:P.orange,fontSize:11,marginTop:3}}>{ex.a}</div>}</div><div style={{background:P.navy,border:`1.5px solid ${P.navyLL}`,borderRadius:8,padding:"5px 10px",fontSize:12,fontFamily:"'Fredoka One', cursive",color:P.white,whiteSpace:"nowrap"}}>{ex.r}</div></div></div>))}
            <div style={{background:P.navy,borderLeft:`3px solid ${P.coral}`,padding:"10px 14px",borderRadius:"0 10px 10px 0",marginTop:14}}><div style={{color:P.coral,fontSize:10,letterSpacing:1,marginBottom:3}}>🧘 RETOUR AU CALME — NE PAS SAUTER !</div><div style={{color:P.gray,fontSize:12}}>5 min d'étirements. 30s par position, sans rebond. Crucial après 40 ans. 🙏</div></div>
          </div>
        </Card>
      </div>}

      {/* LIBRE */}
      {tab==="libre"&&<LibreTab p={p} PAL={P} Card={Card} CH={CH} ST={ST} Toggle={Toggle} INP={INP}/>}

      {/* COMMUNAUTÉ */}
      {tab==="communaute"&&<CommunauteTab p={p} PAL={P} Card={Card} CH={CH} ST={ST}/>}

      {/* NUTRITION */}
      {tab==="nutrition"&&<NutritionTab objParent={p.parentObjectifs}/>}


      {/* TROPHÉES */}
      {tab==="trophees"&&<div>
        <ST icon="🏆" title="Vos Trophées !" sub="Validez des semaines pour débloquer des récompenses" col={P.sun}/>
        <div style={{background:P.navyL,borderRadius:14,padding:"16px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontFamily:"'Fredoka One', cursive",fontSize:16,color:P.white}}>Progression globale</span><span style={{fontFamily:"'Fredoka One', cursive",fontSize:20,color:P.sun}}>{Math.round((semComp/Math.max(p.duree,1))*100)}%</span></div>
          <div style={{height:12,background:P.navy,borderRadius:6,overflow:"hidden"}}><div style={{height:"100%",background:`linear-gradient(90deg,${P.grass},${P.sky},${P.sun})`,width:`${(semComp/Math.max(p.duree,1))*100}%`,transition:"width .5s",borderRadius:6}}/></div>
          <div style={{fontSize:11,color:P.gray,marginTop:8}}>{semComp} / {p.duree} semaines validées</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {TROPHEES.filter(t=>t.s<=p.duree).map(t=>{const ok=t.s<=semComp;return(<div key={t.s} style={{background:ok?P.sun+"18":P.navyL,border:`2px solid ${ok?P.sun+"66":P.navyLL}`,borderRadius:16,padding:"18px 14px",textAlign:"center",opacity:ok?1:.4,boxShadow:ok?`0 4px 20px ${P.sun}33`:"none"}}><div style={{fontSize:40,marginBottom:8,filter:ok?"none":"grayscale(1)"}}>{t.icon}</div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:16,color:ok?P.sun:P.gray,marginBottom:4}}>{t.label}</div><div style={{fontSize:11,color:P.gray}}>{t.desc}</div><div style={{fontSize:10,color:ok?P.grass:P.navyLL,marginTop:8,fontWeight:700,letterSpacing:1}}>{ok?"✓ DÉBLOQUÉ":`Semaine ${t.s}`}</div></div>);})}
        </div>
        {semComp>0&&semComp<p.duree&&<div style={{background:P.grass+"18",border:`1.5px solid ${P.grass}44`,borderRadius:14,padding:"16px 20px",marginTop:16,textAlign:"center"}}><div style={{fontSize:28,marginBottom:6}}>💪</div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:18,color:P.white}}>Plus que <span style={{color:P.grass}}>{p.duree-semComp} semaine{p.duree-semComp>1?"s":""}  </span> !</div><div style={{color:P.gray,fontSize:13,marginTop:4}}>{p.enfantPrenom?`Continue avec ${p.enfantPrenom} — vous êtes sur la bonne voie ! 🚀`:"Vous êtes sur la bonne voie ! 🚀"}</div></div>}
        {semComp>=p.duree&&p.duree>0&&<div style={{background:`linear-gradient(135deg,${P.sun}18,${P.grass}18)`,border:`2px solid ${P.sun}`,borderRadius:18,padding:"24px",marginTop:16,textAlign:"center"}}><div style={{fontSize:52,marginBottom:10}}>🏆</div><div style={{fontFamily:"'Fredoka One', cursive",fontSize:28,color:P.sun,marginBottom:8}}>Programme terminé !</div><div style={{color:P.white,fontSize:15}}>Félicitations — {p.duree} semaines accomplies{p.enfantPrenom?` avec ${p.enfantPrenom}`:""}  ! 🎉</div></div>}
        {semComp===0&&<div style={{textAlign:"center",padding:"30px 0",color:P.gray}}><div style={{fontSize:40,marginBottom:8}}>🎯</div><div>Validez votre première semaine dans Programme pour débloquer votre premier trophée !</div></div>}
      </div>}

    </div>
    {/* BARRE BAS */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:P.navyL,borderTop:`1px solid ${P.navyLL}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {BOTTOM_TABS.map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",padding:"12px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,borderTop:tab===t.id?`3px solid ${P.grass}`:"3px solid transparent"}}>
          <span style={{fontSize:22}}>{t.icon}</span>
          <span style={{fontSize:10,fontFamily:"'Fredoka One', cursive",color:tab===t.id?P.grass:P.gray,letterSpacing:.5}}>{t.label}</span>
        </button>
      ))}
    </div>
    <style>{`input:focus,select:focus{border-color:${P.grass}!important;outline:none}button:active{transform:scale(.96)}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${P.navy}}::-webkit-scrollbar-thumb{background:${P.navyLL};border-radius:3px}`}</style>
  </div>);
}
