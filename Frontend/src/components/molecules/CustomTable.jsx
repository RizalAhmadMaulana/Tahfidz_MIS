const CustomTable = ({ headers, data }) => {
  return (
    <div className="border border-black rounded-[4px] overflow-x-auto bg-white mt-4">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            {headers.map((head, idx) => (
              <th key={idx} className="bg-white border border-black px-3 py-3 text-center align-middle font-[700] text-black text-sm">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Render baris kosong jika data kosong (sesuai desain HTML) */}
          {[1, 2, 3].map((_, idx) => (
            <tr key={idx} className="even:bg-[#f2f2f2]">
              {headers.map((__, colIdx) => (
                <td key={colIdx} className="border border-black px-2 py-2.5 h-[45px]">
                  &nbsp;
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CustomTable;