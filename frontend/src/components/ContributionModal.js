import React from 'react';

export default function ContributionModal({ show, setShow, contribType, setContribType, contribDesc, setContribDesc, selectedEstablishment, setSelectedEstablishment, mockEtablissements, handleSubmitContribution }) {
  return (
    <div className={`modal fade ${show ? "show" : ""}`} style={{ display: show ? "block" : "none" }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-saha">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title" style={{ fontWeight: 700 }}><i className="bi bi-pencil-square text-primary me-2" />Nouvelle Contribution</h5><button type="button" className="btn-close" onClick={() => setShow(false)} /></div>
          <div className="modal-body" style={{ padding: "1.5rem 2rem 2rem" }}>
            <div className="mb-3"><label className="form-label-custom">Type de contribution</label><div className="d-flex gap-2"><button className={`btn flex-grow-1 ${contribType === "ajout" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setContribType("ajout")}><i className="bi bi-plus-circle me-1" />Ajout</button><button className={`btn flex-grow-1 ${contribType === "modification" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setContribType("modification")}><i className="bi bi-pencil me-1" />Modification</button></div></div>
            {contribType === "modification" && <div className="mb-3"><label className="form-label-custom">Établissement concerné</label><select className="form-control-custom" value={selectedEstablishment} onChange={e => setSelectedEstablishment(e.target.value)}><option value="">-- Sélectionner --</option>{mockEtablissements.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>}
            <div className="mb-3"><label className="form-label-custom">Description</label><textarea className="form-control-custom" rows={4} placeholder="Décrivez votre contribution en détail..." value={contribDesc} onChange={e => setContribDesc(e.target.value)} /></div>
            <button className="btn btn-submit" onClick={handleSubmitContribution}><i className="bi bi-send me-2" />Soumettre la contribution</button>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" onClick={() => setShow(false)} />}
    </div>
  );
}