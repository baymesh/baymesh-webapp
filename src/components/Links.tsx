import React from 'react';

interface LinksProps {
  nodeHexId: string;
}
export default function Links({ nodeHexId }: LinksProps) {
  const nodeDecId = parseInt(nodeHexId, 16);

  return (
    <>
        <h3>External Links:</h3>
        <ul>
            <li><a href={`https://data.bayme.sh/node?id=${nodeHexId}`} target="_blank">Bayme.sh Map</a></li>
            <li><a href={`https://meshview.armooo.net/packet_list/${nodeDecId}`} target="_blank" rel="noopener noreferrer">Armooo Meshview</a></li>
            <li><a href={`https://meshtastic.liamcottle.net/?node_id=${nodeDecId}`} target="_blank" rel="noopener noreferrer">Liam's Map</a></li>
            <li><a href={`https://meshmap.net/#${nodeDecId}`} target="_blank" rel="noopener noreferrer">Meshmap.net</a></li>
        </ul>
    </>
  )
}