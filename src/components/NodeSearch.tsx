import { ComboBox, Item, useFilter, Text } from '@adobe/react-spectrum';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { NodeInfo, NodeInfoMap } from '../utils/BayMeshApi';

export default function NodeSearch({ nodeInfos }: { nodeInfos: NodeInfoMap }) {
  const navigate = useNavigate();
  const [options, setOptions] = React.useState<NodeInfo[]>([]);

  useEffect(() => {
    if (!nodeInfos || Object.keys(nodeInfos).length === 0) {
      setOptions([]);
      return;
    }
    setOptions(Object.keys(nodeInfos).map((key) => nodeInfos[key]).sort((a, b) => a.updatedAt - b.updatedAt));
  }, [nodeInfos]);

  let [showAll, setShowAll] = React.useState(false);
  let [filterValue, setFilterValue] = React.useState('');
  let { contains } = useFilter({ sensitivity: 'base' });
  let filteredItems = React.useMemo(
    () => options.filter((item) => contains(item.longName, filterValue) || contains(item.shortName, filterValue) || contains(item.id, filterValue)),
    [options, filterValue]
  );

  return (
    <ComboBox
      onOpenChange={(isOpen, menuTrigger) => {
        // Show all items if menu is opened manually
        // i.e. by the arrow keys or trigger button
        if (menuTrigger === 'manual' && isOpen) {
          setShowAll(true);
        }
      }}
      loadingState={options && options.length > 0 ? 'idle' : 'loading'}
      width="size-5000"
      maxWidth="100%"
      placeholder='Node Search'
      items={showAll ? options : filteredItems}
      inputValue={filterValue}
      onInputChange={(value) => {
        setShowAll(false);
        setFilterValue(value);
      }}
      onSelectionChange={(itemId) => {
        // window.location.href = ;
        navigate(`/node/${itemId}`)
      }}
    >
      {(item) => {
        return (
          <Item>
            <Text slot='icon'><strong>{item.shortName}</strong></Text>
            <Text>{item.longName}</Text>
            <Text slot='description'>{item.id}</Text>
          </Item>
        )
      }}
    </ComboBox>
  );
}