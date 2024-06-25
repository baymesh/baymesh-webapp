import { Form, TextField } from '@adobe/react-spectrum';
import React from 'react';
import { NodeInfo } from '../utils/BayMeshApi';

interface NodeInformationProps {
  nodeInfo: NodeInfo;
}
export default function NodeInformation({ nodeInfo }: NodeInformationProps) {
  return (
    <Form
      isQuiet
      aria-label="Node Information"
      maxWidth="size-3600">
      <TextField isReadOnly label="Short Name" value={nodeInfo.shortName} />
      <TextField isReadOnly label="MAC Address" value={nodeInfo.macaddr} />
      <TextField isReadOnly label="Hex Id" value={nodeInfo.id} />
      <TextField isReadOnly label="Hardware Model" value={nodeInfo.hwModel} />
      <TextField isReadOnly label="Role" value={nodeInfo.role} />
      <TextField isReadOnly label="Hop Start" value={nodeInfo.hopStart.toString()} />
      <TextField isReadOnly label="Updated At" value={new Date(nodeInfo.updatedAt).toLocaleString()} />
    </Form>
  )
}