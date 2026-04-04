import { useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/ui/PageHeader';

const INITIAL = [
  { id: 1, name: 'You', email: 'you@example.com', role: 'owner', split: 70, status: 'active' },
  { id: 2, name: 'Alex Chen', email: 'alex@example.com', role: 'editor', split: 20, status: 'active' },
  { id: 3, name: 'Jamie Rivera', email: 'jamie@example.com', role: 'moderator', split: 10, status: 'invited' },
];

const ROLE_COLORS = { owner: 'bg-primary/20 text-primary', editor: 'bg-accent/20 text-accent', co_creator: 'bg-yellow-500/20 text-yellow-400', manager: 'bg-blue-500/20 text-blue-400', moderator: 'bg-pink-500/20 text-pink-400' };

export default function TeamSplits() {
  const [members, setMembers] = useState(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'editor', split: 0 });

  const totalSplit = members.reduce((s, m) => s + m.split, 0);

  const addMember = () => {
    setMembers([...members, { ...newMember, id: Date.now(), status: 'invited' }]);
    setNewMember({ name: '', email: '', role: 'editor', split: 0 });
    setShowAdd(false);
  };

  const remove = (id) => setMembers(members.filter(m => m.id !== id));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader title="Team Splits" subtitle="Manage your collaborators and revenue sharing.">
        <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 gap-2">
          <UserPlus className="w-4 h-4" /> Add Collaborator
        </Button>
      </PageHeader>

      {/* Total indicator */}
      <div className={`rounded-xl border p-4 flex items-center justify-between ${totalSplit === 100 ? 'border-accent/40 bg-accent/10' : 'border-destructive/40 bg-destructive/10'}`}>
        <span className="text-sm font-medium">Total Split Allocation</span>
        <span className={`text-xl font-display font-bold ${totalSplit === 100 ? 'text-accent' : 'text-destructive'}`}>{totalSplit}%</span>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-primary/30 bg-card p-6 space-y-4">
          <h3 className="font-display font-semibold">Add Collaborator</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} placeholder="Full name" className="bg-muted" /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} placeholder="email@example.com" className="bg-muted" /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select value={newMember.role} onValueChange={v => setNewMember({ ...newMember, role: v })}>
                <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['co_creator','editor','manager','moderator','other'].map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Split %</Label><Input type="number" value={newMember.split} onChange={e => setNewMember({ ...newMember, split: +e.target.value })} min={0} max={100} className="bg-muted" /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={addMember} className="bg-primary hover:bg-primary/90">Add Member</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-3">
        {members.map(({ id, name, email, role, split, status }) => (
          <div key={id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
              {name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{name}</p>
                <Badge className={`${ROLE_COLORS[role] || 'bg-muted text-muted-foreground'} capitalize text-xs`}>{role.replace('_',' ')}</Badge>
                {status === 'invited' && <Badge variant="outline" className="text-xs">Invited</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
            <div className="text-right mr-4">
              <p className="text-xl font-display font-bold text-accent">{split}%</p>
            </div>
            {role !== 'owner' && (
              <Button variant="ghost" size="icon" onClick={() => remove(id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}