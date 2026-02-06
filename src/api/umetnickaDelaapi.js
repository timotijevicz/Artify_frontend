import axiosInstance from "../components/axios/axiosInstance"; // <-- promeni putanju ako ti je drugačije

export async function getArtworksByArtist(umetnikId) {
  const res = await axiosInstance.get(`UmetnickoDelo/DelaPoIDUmetnika/${umetnikId}`);
  return res.data;
}

export async function getArtworkById(id) {
  const res = await axiosInstance.get(`UmetnickoDelo/DeloPoID/${id}`);
  return res.data;
}

export async function createFixedPriceArtwork(payload) {
  const res = await axiosInstance.post(`UmetnickoDelo/DodajNovoDelo`, payload);
  return res.data;
}

export async function createAuctionArtwork(payload) {
  // backend endpoint mora postojati:
  // POST /api/UmetnickoDelo/DodajNovoDeloZaAukciju
  const res = await axiosInstance.post(`UmetnickoDelo/DodajNovoDeloZaAukciju`, payload);
  return res.data;
}

export async function updateArtwork(id, payload) {
  const res = await axiosInstance.put(`UmetnickoDelo/AzurirajDelo/${id}`, payload);
  return res.data;
}

export async function deleteArtwork(id) {
  const res = await axiosInstance.delete(`UmetnickoDelo/ObrisiDelo/${id}`);
  return res.data;
}