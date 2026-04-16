import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Button } from '@/components/design-system/button';
import { Badge } from '@/components/design-system/badge';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  MoreVertical,
  Search,
  Plus,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/design-system/table';
import { notifySigners } from '@/app/actions/signing';
import { revalidatePath } from 'next/cache';
import { cn } from '@/lib/utils';

export default async function ContratosPage() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;

  const contracts = await prisma.contract.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      parties: true,
      property: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const handleNotify = async (id: string) => {
    'use server';
    await notifySigners(id);
    revalidatePath('/contratos');
  };

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
            <FileText className="h-3 w-3 fill-current opacity-20" />
            Contratos & Documentação
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none">Gestão de <span className="text-primary italic">Operação</span></h1>
          <p className="text-muted-foreground font-medium text-sm">Contratos assinados eletronicamente com validade jurídica completa.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Buscar processo..." 
                className="pl-10 h-12 w-64 rounded-2xl bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-xs font-bold transition-all shadow-sm"
              />
           </div>
           <Button className="h-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest px-6 shadow-xl shadow-slate-900/10">
             <Plus className="mr-2 h-5 w-5" /> Novo Contrato
           </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
               <FileText className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Contratos</p>
               <h3 className="text-2xl font-black tracking-tighter">{contracts.length}</h3>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500">
               <Clock className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aguardando Assinatura</p>
               <h3 className="text-2xl font-black tracking-tighter text-orange-600">
                  {contracts.filter((c: any) => c.status !== 'signed').length}
               </h3>
            </div>
         </div>
         <div className="p-6 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/10 flex items-center gap-4 border border-emerald-400">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
               <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Finalizados 100%</p>
               <h3 className="text-2xl font-black tracking-tighter">
                  {contracts.filter((c: any) => c.status === 'signed').length}
               </h3>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[300px] text-[10px] font-black uppercase tracking-widest px-8 py-6">Contrato / Imóvel</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Partes & Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Valor / Data</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">Status Geral</TableHead>
              <TableHead className="text-right px-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract: any) => (
              <TableRow key={contract.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight flex items-center gap-2">
                        #{contract.id.slice(-6).toUpperCase()}
                        <Badge variant="outline" className="text-[9px] font-black rounded-lg border-slate-200 text-slate-400">{contract.type}</Badge>
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{contract.property?.title || 'Contrato Direto'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {contract.parties.map((party: any) => (
                      <div 
                        key={party.id} 
                        className={cn(
                          "h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black uppercase shadow-sm relative group/avatar",
                          party.status === 'signed' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                        )}
                        title={`${party.name} (${party.status})`}
                      >
                        {party.name.charAt(0)}
                        {party.biometricVerified && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 h-3 w-3 rounded-full border border-white flex items-center justify-center">
                            <CheckCircle2 className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {contract.parties.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                        +{contract.parties.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-black tracking-tight">{contract.totalValue ? `R$ ${Number(contract.totalValue).toLocaleString()}` : 'N/A'}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(contract.createdAt).toLocaleDateString('pt-BR')}</p>
                </TableCell>
                <TableCell>
                  {contract.status === 'signed' ? (
                    <Badge className="bg-emerald-500 text-white font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Finalizado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-lg">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right px-8">
                  <div className="flex items-center justify-end gap-2">
                    {contract.status !== 'signed' && (
                      <form action={handleNotify.bind(null, contract.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="h-9 hover:bg-primary/10 hover:text-primary rounded-xl font-black uppercase text-[10px] tracking-widest px-4 group/btn">
                          <Send className="mr-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" /> 
                          Solicitar
                        </Button>
                      </form>
                    )}
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center opacity-40">
                   <div className="space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-slate-200" />
                      <p className="text-xs font-black uppercase tracking-widest">Nenhum contrato encontrado</p>
                      <Button variant="outline" className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest">
                         Criar Primeiro Contrato
                      </Button>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
              Mostrando {contracts.length} processos operacionais
           </p>
           <div className="flex gap-2">
              <Button variant="outline" disabled className="h-10 rounded-xl px-4 text-[10px] font-black uppercase">Anterior</Button>
              <Button variant="outline" disabled className="h-10 rounded-xl px-4 text-[10px] font-black uppercase">Próximo</Button>
           </div>
        </div>
      </div>

      {/* Trust Meta Footer */}
      <div className="flex items-center justify-center gap-8 py-4 opacity-30">
         <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">100% Mobile Ready</span>
         </div>
         <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Criptografia SHA-256</span>
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Compliance MP 2.200-2</span>
         </div>
      </div>
    </div>
  );
}