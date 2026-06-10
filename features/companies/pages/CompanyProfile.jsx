import { UploadCloud, Plus, FileText, Pencil, Save, Check, X, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { updateCompany } from "../services/companies.service";
import { removeMembership, updateMembershipPermission } from "../services/memberships.service";
import { supabase } from "../../shared/services/supabase";
import { MEMBERSHIP_PERMISSION } from "../../../shared/constants/enums";

function Field({ label, value, editing, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">{label}</label>
      <input type="text" disabled={!editing} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full h-9 px-3 border rounded-lg text-sm font-medium ${editing ? "bg-background text-foreground border-primary" : "bg-muted text-foreground border-border"}`} />
    </div>
  );
}

function LinkField({ label, value, editing, onChange, href }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">{label}</label>
      {editing ? (
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 border border-primary rounded-lg text-sm bg-background text-foreground font-medium" />
      ) : href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted text-primary font-medium hover:bg-primary/5 transition-colors truncate">
          {href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ) : (
        <input type="text" disabled value="" className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted text-muted-foreground font-medium" />
      )}
    </div>
  );
}

export default function CompanyProfile({
  company,
  members,
  currentUserPermission,
  currentUserId,
  onInvite,
  onMembersChange,
  onCompanyUpdate,
}) {
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", industry: "", size: "", location: "",
    founding_date: "", description: "", culture: "", benefits: "",
    website_url: "", linkedin_url: "", twitter_url: "",
  });
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isHrManager = currentUserPermission === MEMBERSHIP_PERMISSION.hrManager;

  const pendingMembers = members.filter(
    (m) => m.recruiter_permissions === MEMBERSHIP_PERMISSION.pending
  );
  const activeMembers = members.filter(
    (m) => m.recruiter_permissions !== MEMBERSHIP_PERMISSION.pending
  );

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!memberName || !memberEmail) return;
    onInvite(memberName, memberEmail);
    setMemberName("");
    setMemberEmail("");
  };

  const handleAccept = async (membership) => {
    try {
      const updated = await updateMembershipPermission(membership.id, MEMBERSHIP_PERMISSION.recruiter);
      onMembersChange((prev) => prev.map((m) => (m.id === membership.id ? updated : m)));
    } catch (err) {
      console.error("Error accepting member:", err);
    }
  };

  const handleReject = async (membershipId) => {
    try {
      await removeMembership(membershipId);
      onMembersChange((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (err) {
      console.error("Error rejecting member:", err);
    }
  };

  const handleRemove = async (membershipId) => {
    try {
      await removeMembership(membershipId);
      onMembersChange((prev) => prev.filter((m) => m.id !== membershipId));
    } catch (err) {
      console.error("Error removing member:", err);
    }
  };

  const handleChangePermission = async (membershipId, newPermission) => {
    try {
      const updated = await updateMembershipPermission(membershipId, newPermission);
      onMembersChange((prev) => prev.map((m) => (m.id === membershipId ? updated : m)));
    } catch (err) {
      console.error("Error changing permission:", err);
    }
  };

  const formatPermission = (perm) => {
    if (perm === MEMBERSHIP_PERMISSION.hrManager) return "HR Manager";
    if (perm === MEMBERSHIP_PERMISSION.recruiter) return "Recruiter";
    if (perm === MEMBERSHIP_PERMISSION.pending) return "Pending";
    return perm || "Unknown";
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;
    try {
      setUploadingLogo(true);
      const filePath = `company_logos/${company.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from("company_logos").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("company_logos").getPublicUrl(filePath);
      const updated = await updateCompany(company.id, { logo_url: urlData.publicUrl });
      onCompanyUpdate(updated);
    } catch (err) {
      console.error("Error uploading logo:", err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;
    try {
      setUploadingCover(true);
      const filePath = `company_covers/${company.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from("company_logos").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("company_logos").getPublicUrl(filePath);
      const updated = await updateCompany(company.id, { cover_url: urlData.publicUrl });
      onCompanyUpdate(updated);
    } catch (err) {
      console.error("Error uploading cover:", err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      name: company?.name || "", industry: company?.industry || "",
      size: company?.size ? String(company.size) : "", location: company?.location || "",
      founding_date: company?.founding_date || "", description: company?.description || "",
      culture: company?.culture || "", benefits: company?.benefits || "",
      website_url: company?.website_url || "", linkedin_url: company?.linkedin_url || "",
      twitter_url: company?.twitter_url || "",
    });
    setEditing(true);
  };

  const handleEditCancel = () => setEditing(false);

  const handleEditSave = async () => {
    if (!company?.id) return;
    try {
      const updated = await updateCompany(company.id, {
        name: editForm.name, industry: editForm.industry,
        size: editForm.size ? parseInt(editForm.size, 10) : null, location: editForm.location,
        founding_date: editForm.founding_date || null, description: editForm.description,
        culture: editForm.culture, benefits: editForm.benefits,
        website_url: editForm.website_url, linkedin_url: editForm.linkedin_url, twitter_url: editForm.twitter_url,
      });
      onCompanyUpdate(updated);
      setEditing(false);
    } catch (err) {
      console.error("Error updating company:", err);
    }
  };

  const permissionBadge = (perm) => {
    const styles = {
      [MEMBERSHIP_PERMISSION.hrManager]: "bg-primary/10 text-primary border-primary/20",
      [MEMBERSHIP_PERMISSION.recruiter]: "bg-accent/10 text-accent border-accent/20",
      [MEMBERSHIP_PERMISSION.pending]: "bg-warning/10 text-warning border-warning/20",
    };
    return (
      <span className={`px-2 h-5 flex items-center rounded-md text-[10px] font-bold border shrink-0 ${styles[perm] || "bg-muted text-muted-foreground border-border"}`}>
        {formatPermission(perm)}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-background p-5 rounded-xl border border-border/60 shadow-xs hover:border-accent/20 transition-colors duration-200"
        >
          {/* Cover Image */}
          <div className="relative -mx-5 -mt-5 mb-4 h-36 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/20 group">
            {company?.cover_url ? (
              <img src={company.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10" />
            )}
            {isHrManager && (
              <>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs font-medium">{uploadingCover ? "Uploading..." : "Change Cover"}</span>
                  </div>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 -mt-10 rounded-xl overflow-hidden shrink-0 group cursor-pointer border-2 border-background shadow-xs"
                onClick={() => isHrManager && logoInputRef.current?.click()}>
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain bg-background" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg select-none">
                    {company?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                {isHrManager && (
                  <>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{company?.name || ""}</h2>
                <p className="text-xs text-muted-foreground">
                  {company?.industry || ""}{company?.industry && company?.location ? " · " : ""}{company?.location || ""}
                </p>
              </div>
            </div>
            {isHrManager && !editing && (
              <button onClick={handleEditStart}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors cursor-pointer shrink-0">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {editing && <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary">You are editing company details</div>}

          <div dir="ltr" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Company Name" value={editing ? editForm.name : (company?.name || "")} editing={editing} onChange={(v) => setEditForm({ ...editForm, name: v })} />
              <Field label="Industry" value={editing ? editForm.industry : (company?.industry || "")} editing={editing} onChange={(v) => setEditForm({ ...editForm, industry: v })} />
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Company Size</label>
                {editing ? (
                  <input type="number" value={editForm.size} onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    className="w-full h-9 px-3 border border-primary rounded-lg text-sm bg-background text-foreground font-medium" />
                ) : (
                  <input type="text" disabled value={company?.size ? `${company.size.toLocaleString()} employees` : ""}
                    className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted text-foreground font-medium" />
                )}
              </div>
              <Field label="Location" value={editing ? editForm.location : (company?.location || "")} editing={editing} onChange={(v) => setEditForm({ ...editForm, location: v })} />
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Founded</label>
                {editing ? (
                  <input type="date" value={editForm.founding_date} onChange={(e) => setEditForm({ ...editForm, founding_date: e.target.value })}
                    className="w-full h-9 px-3 border border-primary rounded-lg text-sm bg-background text-foreground font-medium" />
                ) : (
                  <input type="text" disabled value={company?.founding_date || ""}
                    className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted text-foreground font-medium" />
                )}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Created At</label>
                <input type="text" disabled value={company?.created_at ? new Date(company.created_at).toLocaleDateString() : ""}
                  className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted text-foreground font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">About</label>
              {editing ? (
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4}
                  className="w-full px-3 py-2 border border-primary rounded-lg text-sm bg-background text-foreground font-medium resize-none" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{company?.description || "No description provided."}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Culture</label>
              {editing ? (
                <textarea value={editForm.culture} onChange={(e) => setEditForm({ ...editForm, culture: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-primary rounded-lg text-sm bg-background text-foreground font-medium resize-none" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{company?.culture || "No culture info provided."}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Benefits</label>
              {editing ? (
                <textarea value={editForm.benefits} onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-primary rounded-lg text-sm bg-background text-foreground font-medium resize-none" />
              ) : (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{company?.benefits || "No benefits info provided."}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-1">Links</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <LinkField label="Website" value={editing ? editForm.website_url : (company?.website_url || "")} editing={editing}
                  onChange={(v) => setEditForm({ ...editForm, website_url: v })} href={company?.website_url} />
                <LinkField label="LinkedIn" value={editing ? editForm.linkedin_url : (company?.linkedin_url || "")} editing={editing}
                  onChange={(v) => setEditForm({ ...editForm, linkedin_url: v })} href={company?.linkedin_url} />
                <LinkField label="Twitter" value={editing ? editForm.twitter_url : (company?.twitter_url || "")} editing={editing}
                  onChange={(v) => setEditForm({ ...editForm, twitter_url: v })} href={company?.twitter_url} />
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/60">
              <button onClick={handleEditCancel}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleEditSave}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer">
                <Save className="w-3.5 h-3.5" /> Save Changes</button>
            </div>
          )}
        </motion.div>

        {/* Team Members Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-30px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="bg-background p-5 rounded-xl border border-border/60 shadow-xs hover:border-accent/20 transition-colors duration-200"
        >
          <h2 className="text-base font-bold text-foreground mb-0.5">Team Members</h2>
          <p className="text-xs text-muted-foreground/70 mb-4">Invite and manage your recruitment team permissions.</p>

          {isHrManager && (
            <form onSubmit={handleInviteSubmit}
              className="flex flex-col sm:flex-row gap-2 mb-4.5 bg-muted/50 p-2.5 rounded-lg border border-border/50">
              <input required type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)}
                placeholder="Full Name" className="w-full sm:flex-1 h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground font-medium" />
              <input required type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Email" className="w-full sm:flex-1 h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground font-medium" />
              <button type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-1 bg-primary hover:bg-primary-hover text-white px-4 h-9 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Invite</button>
            </form>
          )}

          {isHrManager && pendingMembers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pending Approval</h3>
              <div className="space-y-2">
                {pendingMembers.map((member, i) => (
                  <motion.div key={member.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-center justify-between p-2.5 bg-warning/5 rounded-lg border border-warning/20 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xs font-bold shrink-0">
                        {member.profiles?.full_name ? member.profiles.full_name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{member.profiles?.full_name || "Unknown"}</h4>
                        <p className="text-[11px] text-muted-foreground/70 truncate">{member.profiles?.headline || member.profiles?.role || "team member"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => handleAccept(member)}
                        className="p-1.5 bg-success/20 text-success rounded-md hover:bg-success/30 transition-colors cursor-pointer" title="Accept">
                        <Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleReject(member.id)}
                        className="p-1.5 bg-destructive/20 text-destructive rounded-md hover:bg-destructive/30 transition-colors cursor-pointer" title="Reject">
                        <X className="w-3.5 h-3.5" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3" dir="ltr">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Team Members ({activeMembers.length})</h3>
            {activeMembers.map((member, i) => (
              <motion.div key={member.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-30px" }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: "easeOut" }}
                className="flex items-center justify-between pb-3 border-b border-border/40 last:border-0 last:pb-0 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 select-none">
                    {member.profiles?.full_name ? member.profiles.full_name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-foreground truncate">{member.profiles?.full_name || "Unknown"}</h4>
                    <p className="text-[11px] text-muted-foreground/70 truncate font-medium">
                      {member.profiles?.headline || member.profiles?.role || "team member"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(isHrManager && member.profile_id !== currentUserId) ? (
                    <select value={member.recruiter_permissions}
                      onChange={(e) => handleChangePermission(member.id, e.target.value)}
                      className="px-2 h-6 rounded-md text-[10px] font-bold border bg-background text-foreground border-border cursor-pointer">
                      <option value={MEMBERSHIP_PERMISSION.recruiter}>Recruiter</option>
                      <option value={MEMBERSHIP_PERMISSION.hrManager}>HR Manager</option>
                    </select>
                  ) : (
                    permissionBadge(member.recruiter_permissions)
                  )}
                  {(isHrManager && member.profile_id !== currentUserId) && (
                    <button onClick={() => handleRemove(member.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer" title="Remove member">
                      <Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
