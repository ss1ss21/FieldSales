import type { Customer } from "../../../api/services";

interface Props {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export default function CustomerTable({ customers, loading, onEdit, onDelete }: Props) {
  if (loading) return <div className="p-6 text-center text-gray-500">Yükleniyor...</div>;
  if (customers.length === 0) return <div className="p-6 text-center text-gray-500">Henüz kayıtlı müşteri bulunmuyor.</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold text-gray-600">Bayi Adı</th>
            <th className="p-4 font-semibold text-gray-600">Yetkili</th>
            <th className="p-4 font-semibold text-gray-600">Adres</th>
            <th className="p-4 font-semibold text-gray-600">Personel</th>
            <th className="p-4 font-semibold text-gray-600">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-medium">{c.dealerName}</td>
              <td className="p-4">{c.contactName}</td>
              
              {/* ÇÖZÜM BURADA: Metni bir div içine aldık */}
              <td className="p-4 text-gray-600">
                <div className="max-w-xs truncate" title={c.address}>
                  {c.address}
                </div>
              </td>
              
              <td className="p-4 text-gray-600">
                {c.personnel?.fullName || <span className="text-red-500 font-medium">Atama Yok</span>}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <button
                    title="Düzenle"
                    className="text-gray-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition"
                    onClick={() => onEdit(c)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button
                    title="Sil"
                    className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    onClick={() => onDelete(c)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}