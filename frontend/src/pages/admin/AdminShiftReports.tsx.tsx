import { BarChart, Bar, XAxis, YAxis,CartesianGrid ,Tooltip, Legend } from 'recharts';

const data = [
    { label: 'Pazartesi', Onaylandı: 4000, Reddedildi: 2400, Ertelendi: 2400 },
    { label: 'Salı', Onaylandı: 3000, Reddedildi: 1398, Ertelendi: 1398 },
    { label: 'Carsamba', Onaylandı: 3000, Reddedildi: 1398, Ertelendi: 1398 },
    { label: 'Persembe', Onaylandı: 3000, Reddedildi: 1598, Ertelendi: 1398 },
    { label: 'Cuma', Onaylandı: 3000, Reddedildi: 1398, Ertelendi: 1398 },
    { label: 'Cumartesi', Onaylandı: 3000, Reddedildi: 1398, Ertelendi: 1398 },
    { label: 'Pazar', Onaylandı: 3000, Reddedildi: 1398, Ertelendi: 1398 }]


    const tooltipContent = ({active, payload, label}: any) =>{
        console.log("Tooltip payload:", payload);
        if (active && payload && payload.length > 0) {
            return (
                <div className="custom-tooltip bg-gray-200 p-2 rounded shadow-lg">
                    <p className="label">{`${label}`}</p>
                    <p className="intro">{`Onaylandı: ${payload[0].value}`}</p>
                    <p className="desc">{`Reddedildi: ${payload[1].value}`}</p>
                    <p className="desc">{`Ertelendi: ${payload[2].value}`}</p>
                </div>
            );
        }
        return null;
    }

const AdminShiftReports = () => {
    return (
        <BarChart
            style={{
                width: '100%', maxWidth: '700px', maxHeight: '70vh',
                aspectRatio: 1.618, outline: 'none'
            }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid fill="#b8b7b7" />
            <XAxis dataKey="label" />
            <YAxis width="auto" />
            <Tooltip content={tooltipContent} />
            <Legend />
            <Bar dataKey="Onaylandı" fill="red" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Reddedildi" fill="green" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Ertelendi" fill="gray" radius={[5, 5, 0, 0]} />
        </BarChart>
    );
    
};

export default AdminShiftReports;