import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={ "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 if(req.method!=="POST") return json({error:"Méthode non autorisée"},405);
 try {
  const {name,phone,password}=await req.json();
  const cleanName=String(name||"").trim();
  let digits=String(phone||"").replace(/\D/g,"");
  if(digits.startsWith("00")) digits=digits.slice(2);
  if(digits.startsWith("0")) digits="225"+digits.slice(1);
  else if(!digits.startsWith("225")) digits="225"+digits;
  if(cleanName.length<2||cleanName.length>80) return json({error:"Saisis ton nom complet."},400);
  if(!/^225[0-9]{8,10}$/.test(digits)) return json({error:"Numéro invalide. Utilise un numéro ivoirien valide."},400);
  if(typeof password!=="string"||password.length<8) return json({error:"Le mot de passe doit contenir au moins 8 caractères."},400);
  if(password.length>72) return json({error:"Mot de passe trop long."},400);
  const url=Deno.env.get("SUPABASE_URL")!;
  const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const phoneE164="+"+digits;
  const {data:created,error:createError}=await admin.auth.admin.createUser({phone:phoneE164,password,phone_confirm:true,user_metadata:{display_name:cleanName,phone_number:phoneE164,account_type:"scanner"}});
  if(createError) {
    const duplicate=/already|exists|registered|unique/i.test(createError.message);
    return json({error:duplicate?"Ce numéro est déjà inscrit. Connecte-toi ou contacte l’administrateur.":createError.message},duplicate?409:400);
  }
  const {error:requestError}=await admin.from("agent_access_requests").insert({user_id:created.user.id,event_id:"c082cc90-dbc8-4de4-8e60-e378fde02a8f",display_name:cleanName,phone:phoneE164,email:null,status:"pending"});
  if(requestError){await admin.auth.admin.deleteUser(created.user.id);return json({error:"Impossible d’enregistrer la demande. Réessaie."},500);}
  return json({ok:true,message:"Demande envoyée",phone:phoneE164});
 } catch(e) { return json({error:"Données invalides ou erreur serveur."},400); }
});