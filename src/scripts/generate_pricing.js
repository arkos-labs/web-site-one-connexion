
const rawData = `
Melun	77288	77000	Melun
Achères-la-Forêt	77001	77760	Fontainebleau
Amillis	77002	77120	Meaux
Amponville	77003	77760	Fontainebleau
Andrezel	77004	77390	Melun
Annet-sur-Marne	77005	77410	Meaux
Arbonne-la-Forêt	77006	77630	Fontainebleau
Argentières	77007	77390	Melun
Armentières-en-Brie	77008	77440	Meaux
Arville	77009	77890	Fontainebleau
Aubepierre-Ozouer-le-Repos	77010	77720	Provins
Aufferville	77011	77570	Fontainebleau
Augers-en-Brie	77012	77560	Provins
Aulnoy	77013	77120	Meaux
Avon	77014	77210	Fontainebleau
Baby	77015	77480	Provins
Bagneaux-sur-Loing	77016	77167	Fontainebleau
Bailly-Romainvilliers	77018	77700	Torcy
Balloy	77019	77118	Provins
Bannost-Villegagnon	77020	77970	Provins
Barbey	77021	77130	Provins
Barbizon	77022	77630	Fontainebleau
Barcy	77023	77910	Meaux
Bassevelle	77024	77750	Meaux
Bazoches-lès-Bray	77025	77118	Provins
Beauchery-Saint-Martin	77026	77560	Provins
Beaumont-du-Gâtinais	77027	77890	Fontainebleau
Beautheil-Saints	77433	77120	Meaux
Beauvoir	77029	77390	Melun
Bellot	77030	77510	Provins
Bernay-Vilbert	77031	77540	Provins
Beton-Bazoches	77032	77320	Provins
Bezalles	77033	77970	Provins
Blandy	77034	77115	Melun
Blennes	77035	77940	Provins
Bois-le-Roi	77037	77590	Fontainebleau
Boisdon	77036	77970	Provins
Boissettes	77038	77350	Melun
Boissise-la-Bertrand	77039	77350	Melun
Boissise-le-Roi	77040	77310	Melun
Boissy-aux-Cailles	77041	77760	Fontainebleau
Boissy-le-Châtel	77042	77169	Meaux
Boitron	77043	77750	Provins
Bombon	77044	77720	Melun
Bougligny	77045	77570	Fontainebleau
Boulancourt	77046	77760	Fontainebleau
Bouleurs	77047	77580	Meaux
Bourron-Marlotte	77048	77780	Fontainebleau
Boutigny	77049	77470	Meaux
Bransles	77050	77620	Fontainebleau
Bray-sur-Seine	77051	77480	Provins
Bréau	77052	77720	Provins
Brie-Comte-Robert	77053	77170	Torcy
La Brosse-Montceaux	77054	77940	Provins
Brou-sur-Chantereine	77055	77177	Torcy
Burcy	77056	77760	Fontainebleau
Bussières	77057	77750	Meaux
Bussy-Saint-Georges	77058	77600	Torcy
Bussy-Saint-Martin	77059	77600	Torcy
Buthiers	77060	77760	Fontainebleau
Cannes-Écluse	77061	77130	Provins
Carnetin	77062	77400	Torcy
La Celle-sur-Morin	77063	77515	Meaux
Cély	77065	77930	Fontainebleau
Cerneux	77066	77320	Provins
Cesson	77067	77240	Melun
Cessoy-en-Montois	77068	77520	Provins
Chailly-en-Bière	77069	77930	Fontainebleau
Chailly-en-Brie	77070	77120	Meaux
Chaintreaux	77071	77460	Fontainebleau
Chalautre-la-Grande	77072	77171	Provins
Chalautre-la-Petite	77073	77160	Provins
Chalifert	77075	77144	Torcy
Chalmaison	77076	77650	Provins
Chambry	77077	77910	Meaux
Chamigny	77078	77260	Meaux
Champagne-sur-Seine	77079	77430	Fontainebleau
Champcenest	77080	77560	Provins
Champdeuil	77081	77390	Melun
Champeaux	77082	77720	Melun
Champs-sur-Marne	77083	77420	Torcy
Changis-sur-Marne	77084	77660	Meaux
Chanteloup-en-Brie	77085	77600	Torcy
La Chapelle-Gauthier	77086	77720	Provins
La Chapelle-Iger	77087	77540	Provins
La Chapelle-la-Reine	77088	77760	Fontainebleau
La Chapelle-Moutils	77093	77320	Provins
La Chapelle-Rablais	77089	77370	Provins
La Chapelle-Saint-Sulpice	77090	77160	Provins
Les Chapelles-Bourbon	77091	77610	Provins
Charmentray	77094	77410	Meaux
Charny	77095	77410	Meaux
Chartrettes	77096	77590	Fontainebleau
Chartronges	77097	77320	Provins
Château-Landon	77099	77570	Fontainebleau
Châteaubleau	77098	77370	Provins
Le Châtelet-en-Brie	77100	77820	Melun
Châtenay-sur-Seine	77101	77126	Provins
Châtenoy	77102	77167	Fontainebleau
Châtillon-la-Borde	77103	77820	Melun
Châtres	77104	77610	Provins
Chauconin-Neufmontiers	77335	77124	Meaux
Chauffry	77106	77169	Meaux
Chaumes-en-Brie	77107	77390	Melun
Chelles	77108	77500	Torcy
Chenoise-Cucharmoy	77109	77160	Provins
Chenou	77110	77570	Fontainebleau
Chessy	77111	77700	Torcy
Chevrainvilliers	77112	77760	Fontainebleau
Chevru	77113	77320	Meaux
Chevry-Cossigny	77114	77173	Torcy
Chevry-en-Sereine	77115	77710	Provins
Choisy-en-Brie	77116	77320	Provins
Citry	77117	77730	Meaux
Claye-Souilly	77118	77410	Meaux
Clos-Fontaine	77119	77370	Provins
Cocherel	77120	77440	Meaux
Collégien	77121	77090	Torcy
Combs-la-Ville	77122	77380	Melun
Compans	77123	77290	Meaux
Conches-sur-Gondoire	77124	77600	Torcy
Condé-Sainte-Libiaire	77125	77450	Meaux
Congis-sur-Thérouanne	77126	77440	Meaux
Coubert	77127	77170	Melun
Couilly-Pont-aux-Dames	77128	77860	Meaux
Coulombs-en-Valois	77129	77840	Meaux
Coulommes	77130	77580	Meaux
Coulommiers	77131	77120	Meaux
Coupvray	77132	77700	Torcy
Courcelles-en-Bassée	77133	77126	Provins
Courchamp	77134	77560	Provins
Courpalay	77135	77540	Provins
Courquetaine	77136	77390	Melun
Courtacon	77137	77560	Provins
Courtomer	77138	77390	Provins
Courtry	77139	77181	Torcy
Coutençon	77140	77154	Provins
Coutevroult	77141	77580	Meaux
Crécy-la-Chapelle	77142	77580	Meaux
Crégy-lès-Meaux	77143	77124	Meaux
Crèvecœur-en-Brie	77144	77610	Provins
Crisenoy	77145	77390	Melun
Croissy-Beaubourg	77146	77183	Torcy
La Croix-en-Brie	77147	77370	Provins
Crouy-sur-Ourcq	77148	77840	Meaux
Cuisy	77150	77165	Meaux
Dagny	77151	77320	Meaux
Dammarie-les-Lys	77152	77190	Melun
Dammartin-en-Goële	77153	77230	Meaux
Dammartin-sur-Tigeaux	77154	77163	Meaux
Dampmart	77155	77400	Torcy
Darvault	77156	77140	Fontainebleau
Dhuisy	77157	77440	Meaux
Diant	77158	77940	Provins
Donnemarie-Dontilly	77159	77520	Provins
Dormelles	77161	77130	Fontainebleau
Doue	77162	77510	Provins
Douy-la-Ramée	77163	77139	Meaux
Échouboulains	77164	77830	Melun
Les Écrennes	77165	77820	Melun
Égligny	77167	77126	Provins
Égreville	77168	77620	Fontainebleau
Émerainville	77169	77184	Torcy
Esbly	77171	77450	Torcy
Esmans	77172	77940	Provins
Étrépilly	77173	77139	Meaux
Everly	77174	77157	Provins
Évry-Grégy-sur-Yerre	77175	77166	Melun
Faremoutiers	77176	77515	Meaux
Favières	77177	77220	Provins
Faÿ-lès-Nemours	77178	77167	Fontainebleau
Féricy	77179	77133	Melun
Férolles-Attilly	77180	77150	Torcy
Ferrières-en-Brie	77181	77164	Torcy
La Ferté-Gaucher	77182	77320	Provins
La Ferté-sous-Jouarre	77183	77260	Meaux
Flagy	77184	77940	Fontainebleau
Fleury-en-Bière	77185	77930	Fontainebleau
Fontaine-Fourches	77187	77480	Provins
Fontaine-le-Port	77188	77590	Melun
Fontainebleau	77186	77300	Fontainebleau
Fontains	77190	77370	Provins
Fontenailles	77191	77370	Provins
Fontenay-Trésigny	77192	77610	Provins
Forfry	77193	77165	Meaux
Forges	77194	77130	Provins
Fouju	77195	77390	Melun
Fresnes-sur-Marne	77196	77410	Meaux
Frétoy	77197	77320	Provins
Fromont	77198	77760	Fontainebleau
Fublaines	77199	77470	Meaux
Garentreville	77200	77890	Fontainebleau
Gastins	77201	77370	Provins
La Genevraye	77202	77690	Fontainebleau
Germigny-l'Évêque	77203	77910	Meaux
Germigny-sous-Coulombs	77204	77840	Meaux
Gesvres-le-Chapitre	77205	77165	Meaux
Giremoutiers	77206	77120	Meaux
Gironville	77207	77890	Fontainebleau
Gouaix	77208	77114	Provins
Gouvernes	77209	77400	Torcy
La Grande-Paroisse	77210	77130	Provins
Grandpuits-Bailly-Carrois	77211	77720	Provins
Gravon	77212	77118	Provins
Gressy	77214	77410	Meaux
Gretz-Armainvilliers	77215	77220	Torcy
Grez-sur-Loing	77216	77880	Fontainebleau
Grisy-Suisnes	77217	77166	Melun
Grisy-sur-Seine	77218	77480	Provins
Guérard	77219	77580	Meaux
Guercheville	77220	77760	Fontainebleau
Guermantes	77221	77600	Torcy
Guignes	77222	77390	Melun
Gurcy-le-Châtel	77223	77520	Provins
La Haute-Maison	77225	77580	Meaux
Hautefeuille	77224	77515	Meaux
Héricy	77226	77850	Fontainebleau
Hermé	77227	77114	Provins
Hondevilliers	77228	77510	Provins
La Houssaye-en-Brie	77229	77610	Provins
Ichy	77230	77890	Fontainebleau
Isles-les-Meldeuses	77231	77440	Meaux
Isles-lès-Villenoy	77232	77450	Meaux
Iverny	77233	77165	Meaux
Jablines	77234	77450	Torcy
Jaignes	77235	77440	Meaux
Jaulnes	77236	77480	Provins
Jossigny	77237	77600	Torcy
Jouarre	77238	77640	Meaux
Jouy-le-Châtel	77239	77970	Provins
Jouy-sur-Morin	77240	77320	Provins
Juilly	77241	77230	Meaux
Jutigny	77242	77650	Provins
Lagny-sur-Marne	77243	77400	Torcy
Larchant	77244	77760	Fontainebleau
Laval-en-Brie	77245	77148	Provins
Léchelle	77246	77171	Provins
Lescherolles	77247	77320	Provins
Lesches	77248	77450	Torcy
Lésigny	77249	77150	Torcy
Leudon-en-Brie	77250	77320	Provins
Lieusaint	77251	77127	Melun
Limoges-Fourches	77252	77550	Melun
Lissy	77253	77550	Melun
Liverdy-en-Brie	77254	77220	Provins
Livry-sur-Seine	77255	77000	Melun
Lizines	77256	77650	Provins
Lizy-sur-Ourcq	77257	77440	Meaux
Lognes	77258	77185	Torcy
Longperrier	77259	77230	Meaux
Longueville	77260	77650	Provins
Lorrez-le-Bocage-Préaux	77261	77710	Fontainebleau
Louan-Villegruis-Fontaine	77262	77560	Provins
Luisetaines	77263	77520	Provins
Lumigny-Nesles-Ormeaux	77264	77540	Provins
Luzancy	77265	77138	Meaux
Machault	77266	77133	Melun
La Madeleine-sur-Loing	77267	77570	Fontainebleau
Magny-le-Hongre	77268	77700	Torcy
Maincy	77269	77950	Melun
Maison-Rouge	77272	77370	Provins
Maisoncelles-en-Brie	77270	77580	Meaux
Maisoncelles-en-Gâtinais	77271	77570	Fontainebleau
Marchémoret	77273	77230	Meaux
Marcilly	77274	77139	Meaux
Les Marêts	77275	77560	Provins
Mareuil-lès-Meaux	77276	77100	Meaux
Marles-en-Brie	77277	77610	Provins
Marolles-en-Brie	77278	77120	Meaux
Marolles-sur-Seine	77279	77130	Provins
Mary-sur-Marne	77280	77440	Meaux
Mauperthuis	77281	77120	Meaux
Mauregard	77282	77990	Meaux
May-en-Multien	77283	77145	Meaux
Meaux	77284	77100	Meaux
Le Mée-sur-Seine	77285	77350	Melun
Meigneux	77286	77520	Provins
Meilleray	77287	77320	Provins
Melz-sur-Seine	77289	77171	Provins
Méry-sur-Marne	77290	77730	Meaux
Le Mesnil-Amelot	77291	77990	Meaux
Messy	77292	77410	Meaux
Misy-sur-Yonne	77293	77130	Provins
Mitry-Mory	77294	77290	Meaux
Moisenay	77295	77950	Melun
Moissy-Cramayel	77296	77550	Melun
Moncourt-Fromonville	77302	77140	Fontainebleau
Mondreville	77297	77570	Fontainebleau
Mons-en-Montois	77298	77520	Provins
Montceaux-lès-Meaux	77300	77470	Meaux
Montceaux-lès-Provins	77301	77151	Provins
Montdauphin	77303	77320	Provins
Montenils	77304	77320	Provins
Montereau-Fault-Yonne	77305	77130	Provins
Montereau-sur-le-Jard	77306	77950	Melun
Montévrain	77307	77144	Torcy
Montgé-en-Goële	77308	77230	Meaux
Monthyon	77309	77122	Meaux
Montigny-le-Guesdier	77310	77480	Provins
Montigny-Lencoup	77311	77520	Provins
Montigny-sur-Loing	77312	77690	Fontainebleau
Montmachoux	77313	77940	Provins
Montolivet	77314	77320	Provins
Montry	77315	77450	Torcy
Moret-Loing-et-Orvanne	77316	77250	Fontainebleau
Mormant	77317	77720	Provins
Mortcerf	77318	77163	Provins
Mortery	77319	77160	Provins
Mouroux	77320	77120	Meaux
Mousseaux-lès-Bray	77321	77480	Provins
Moussy-le-Neuf	77322	77230	Meaux
Moussy-le-Vieux	77323	77230	Meaux
Mouy-sur-Seine	77325	77480	Provins
Nandy	77326	77176	Melun
Nangis	77327	77370	Provins
Nanteau-sur-Essonne	77328	77760	Fontainebleau
Nanteau-sur-Lunain	77329	77710	Fontainebleau
Nanteuil-lès-Meaux	77330	77100	Meaux
Nanteuil-sur-Marne	77331	77730	Meaux
Nantouillet	77332	77230	Meaux
Nemours	77333	77140	Fontainebleau
Neufmoutiers-en-Brie	77336	77610	Provins
Noisiel	77337	77186	Torcy
Noisy-Rudignon	77338	77940	Provins
Noisy-sur-École	77339	77123	Fontainebleau
Nonville	77340	77140	Fontainebleau
Noyen-sur-Seine	77341	77114	Provins
Obsonville	77342	77890	Fontainebleau
Ocquerre	77343	77440	Meaux
Oissery	77344	77178	Meaux
Orly-sur-Morin	77345	77750	Provins
Les Ormes-sur-Voulzie	77347	77134	Provins
Ormesson	77348	77167	Fontainebleau
Othis	77349	77280	Meaux
Ozoir-la-Ferrière	77350	77330	Torcy
Ozouer-le-Voulgis	77352	77390	Melun
Paley	77353	77710	Fontainebleau
Pamfou	77354	77830	Melun
Paroy	77355	77520	Provins
Passy-sur-Seine	77356	77480	Provins
Pécy	77357	77970	Provins
Penchard	77358	77124	Meaux
Perthes	77359	77930	Fontainebleau
Pézarches	77360	77131	Meaux
Pierre-Levée	77361	77580	Meaux
Le Pin	77363	77181	Meaux
Le Plessis-aux-Bois	77364	77165	Meaux
Le Plessis-Feu-Aussoux	77365	77540	Provins
Le Plessis-l'Évêque	77366	77165	Meaux
Le Plessis-Placy	77367	77440	Meaux
Poigny	77368	77160	Provins
Poincy	77369	77470	Meaux
Poligny	77370	77167	Fontainebleau
Pommeuse	77371	77515	Meaux
Pomponne	77372	77400	Torcy
Pontault-Combault	77373	77340	Torcy
Pontcarré	77374	77135	Torcy
Précy-sur-Marne	77376	77410	Meaux
Presles-en-Brie	77377	77220	Provins
Pringy	77378	77310	Melun
Provins	77379	77160	Provins
Puisieux	77380	77139	Meaux
Quiers	77381	77720	Provins
Quincy-Voisins	77382	77860	Meaux
Rampillon	77383	77370	Provins
Réau	77384	77550	Melun
Rebais	77385	77510	Provins
Recloses	77386	77760	Fontainebleau
Remauville	77387	77710	Fontainebleau
Reuil-en-Brie	77388	77260	Meaux
La Rochette	77389	77000	Melun
Roissy-en-Brie	77390	77680	Torcy
Rouilly	77391	77160	Provins
Rouvres	77392	77230	Meaux
Rozay-en-Brie	77393	77540	Provins
Rubelles	77394	77950	Melun
Rumont	77395	77760	Fontainebleau
Rupéreux	77396	77560	Provins
Saâcy-sur-Marne	77397	77730	Meaux
Sablonnières	77398	77510	Provins
Saint-Augustin	77400	77515	Meaux
Saint-Barthélemy	77402	77320	Provins
Saint-Brice	77403	77160	Provins
Saint-Cyr-sur-Morin	77405	77750	Provins
Saint-Denis-lès-Rebais	77406	77510	Provins
Saint-Fargeau-Ponthierry	77407	77310	Melun
Saint-Fiacre	77408	77470	Meaux
Saint-Germain-Laval	77409	77130	Provins
Saint-Germain-Laxis	77410	77950	Melun
Saint-Germain-sous-Doue	77411	77169	Provins
Saint-Germain-sur-École	77412	77930	Fontainebleau
Saint-Germain-sur-Morin	77413	77860	Torcy
Saint-Hilliers	77414	77160	Provins
Saint-Jean-les-Deux-Jumeaux	77415	77660	Meaux
Saint-Just-en-Brie	77416	77370	Provins
Saint-Léger	77417	77510	Provins
Saint-Loup-de-Naud	77418	77650	Provins
Saint-Mammès	77419	77670	Fontainebleau
Saint-Mard	77420	77230	Meaux
Saint-Mars-Vieux-Maisons	77421	77320	Provins
Saint-Martin-des-Champs	77423	77320	Provins
Saint-Martin-du-Boschet	77424	77320	Provins
Saint-Martin-en-Bière	77425	77630	Fontainebleau
Saint-Méry	77426	77720	Melun
Saint-Mesmes	77427	77410	Meaux
Saint-Ouen-en-Brie	77428	77720	Provins
Saint-Ouen-sur-Morin	77429	77750	Provins
Saint-Pathus	77430	77178	Meaux
Saint-Pierre-lès-Nemours	77431	77140	Fontainebleau
Saint-Rémy-de-la-Vanne	77432	77320	Provins
Saint-Sauveur-lès-Bray	77434	77480	Provins
Saint-Sauveur-sur-École	77435	77930	Fontainebleau
Saint-Siméon	77436	77169	Provins
Saint-Soupplets	77437	77165	Meaux
Saint-Thibault-des-Vignes	77438	77400	Torcy
Sainte-Aulde	77401	77260	Meaux
Sainte-Colombe	77404	77650	Provins
Salins	77439	77148	Provins
Sammeron	77440	77260	Meaux
Samois-sur-Seine	77441	77920	Fontainebleau
Samoreau	77442	77210	Fontainebleau
Sancy	77443	77580	Meaux
Sancy-lès-Provins	77444	77320	Provins
Savigny-le-Temple	77445	77176	Melun
Savins	77446	77650	Provins
Seine-Port	77447	77240	Melun
Sept-Sorts	77448	77260	Meaux
Serris	77449	77700	Torcy
Servon	77450	77170	Torcy
Signy-Signets	77451	77640	Meaux
Sigy	77452	77520	Provins
Sivry-Courtry	77453	77115	Melun
Sognolles-en-Montois	77454	77520	Provins
Soignolles-en-Brie	77455	77111	Melun
Soisy-Bouy	77456	77650	Provins
Solers	77457	77111	Melun
Souppes-sur-Loing	77458	77460	Fontainebleau
Sourdun	77459	77171	Provins
Tancrou	77460	77440	Meaux
Thénisy	77461	77520	Provins
Thieux	77462	77230	Meaux
Thomery	77463	77810	Fontainebleau
Thorigny-sur-Marne	77464	77400	Torcy
Thoury-Férottes	77465	77940	Provins
Tigeaux	77466	77163	Meaux
La Tombe	77467	77130	Provins
Torcy	77468	77200	Torcy
Touquin	77469	77131	Meaux
Tournan-en-Brie	77470	77220	Torcy
Tousson	77471	77123	Fontainebleau
La Trétoire	77472	77510	Provins
Treuzy-Levelay	77473	77710	Fontainebleau
Trilbardou	77474	77450	Meaux
Trilport	77475	77470	Meaux
Trocy-en-Multien	77476	77440	Meaux
Ury	77477	77760	Fontainebleau
Ussy-sur-Marne	77478	77260	Meaux
Vaires-sur-Marne	77479	77360	Torcy
Valence-en-Brie	77480	77830	Melun
Vanvillé	77481	77370	Provins
Varennes-sur-Seine	77482	77130	Provins
Varreddes	77483	77910	Meaux
Vaucourtois	77484	77580	Meaux
Le Vaudoué	77485	77123	Fontainebleau
Vaudoy-en-Brie	77486	77141	Provins
Vaux-le-Pénil	77487	77000	Melun
Vaux-sur-Lunain	77489	77710	Fontainebleau
Vendrest	77490	77440	Meaux
Verdelot	77492	77510	Provins
Verneuil-l'Étang	77493	77390	Provins
Vernou-la-Celle-sur-Seine	77494	77670	Fontainebleau
Vert-Saint-Denis	77495	77240	Melun
Vieux-Champagne	77496	77370	Provins
Vignely	77498	77450	Meaux
Ville-Saint-Jacques	77516	77130	Fontainebleau
Villebéon	77500	77710	Fontainebleau
Villecerf	77501	77250	Fontainebleau
Villemaréchal	77504	77710	Fontainebleau
Villemareuil	77505	77470	Meaux
Villemer	77506	77250	Fontainebleau
Villenauxe-la-Petite	77507	77480	Provins
Villeneuve-le-Comte	77508	77174	Torcy
Villeneuve-les-Bordes	77509	77154	Provins
Villeneuve-Saint-Denis	77510	77174	Torcy
Villeneuve-sous-Dammartin	77511	77230	Meaux
Villeneuve-sur-Bellot	77512	77510	Provins
Villenoy	77513	77124	Meaux
Villeparisis	77514	77270	Meaux
Villeroy	77515	77410	Meaux
Villevaudé	77517	77410	Meaux
Villiers-en-Bière	77518	77190	Melun
Villiers-Saint-Georges	77519	77560	Provins
Villiers-sous-Grez	77520	77760	Fontainebleau
Villiers-sur-Morin	77521	77580	Meaux
Villiers-sur-Seine	77522	77114	Provins
Villuis	77523	77480	Provins
Vimpelles	77524	77520	Provins
Vinantes	77525	77230	Meaux
Vincy-Manœuvre	77526	77139	Meaux
Voinsles	77527	77540	Provins
Voisenon	77528	77950	Melun
Voulangis	77529	77580	Meaux
Voulton	77530	77560	Provins
Voulx	77531	77940	Provins
Vulaines-lès-Provins	77532	77160	Provins
Vulaines-sur-Seine	77533	77870	Fontainebleau
Yèbles	77534	77390	Melun
`;

// Tarifs par arrondissement
const TARIFS = {
    "Torcy": { N: 14, E: 18, F: 23 },
    "Meaux": { N: 25, E: 30, F: 38 },
    "Melun": { N: 28, E: 33, F: 40 },
    "Fontainebleau": { N: 32, E: 38, F: 45 },
    "Provins": { N: 45, E: 52, F: 62 }
};

// Fonction de normalisation (identique à celle du projet)
function normaliserVille(ville) {
    return ville
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
}

// Parsing
const lines = rawData.trim().split('\n');
const result = {};

lines.forEach(line => {
    const parts = line.split('\t');
    if (parts.length >= 4) {
        const nom = parts[0].trim();
        const arrondissement = parts[3].trim();

        // Nettoyer le nom (enlever les parenthèses s'il y en a)
        const nomPropre = nom.split('(')[0].trim();

        const tarif = TARIFS[arrondissement];
        if (tarif) {
            const key = normaliserVille(nomPropre);
            result[key] = tarif;
        }
    }
});

// Génération du code
const fs = require('fs');
let output = '// Seine-et-Marne (77) - Généré automatiquement\n';
Object.keys(result).sort().forEach(key => {
    const t = result[key];
    output += `    "${key}": { N: ${t.N}, E: ${t.E}, F: ${t.F} },\n`;
});
fs.writeFileSync('src/scripts/pricing_77.txt', output);
console.log('Fichier généré : src/scripts/pricing_77.txt');

