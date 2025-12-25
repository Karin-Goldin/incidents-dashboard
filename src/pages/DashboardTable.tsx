import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { mockdata } from "@/mockdata";

const DashboardTable = () => {
  return (
    <div className="p-4">
      <Table aria-label="Example static collection table">
        <TableHeader>
          <TableColumn>SEVERITY</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>SOURCE</TableColumn>
          <TableColumn>TIMESTAMP</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          {mockdata.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>{incident.severity}</TableCell>
              <TableCell>{incident.category}</TableCell>
              <TableCell>{incident.source}</TableCell>
              <TableCell>{incident.timestamp}</TableCell>
              <TableCell>{incident.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DashboardTable;
