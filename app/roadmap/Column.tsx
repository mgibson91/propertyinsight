import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ItemType } from '@/app/roadmap/types';
import { ListItem } from '@/app/roadmap/ListItem';
import { Card, Heading } from '@radix-ui/themes';

type ComponentType = {
  title: string;
  prefix: string;
  elements: Array<ItemType>;
  onItemClicked: (item: ItemType) => void;
};

export const Column = ({ title, prefix, elements, onItemClicked }: ComponentType) => {
  return (
    <Card>
      <Heading size={'5'} mb={'2'}>
        {title}
      </Heading>

      <Droppable droppableId={`${prefix}`}>
        {provided => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {elements.map((item: ItemType, index: number) => (
              <ListItem key={item.id} item={item} index={index} onItemClicked={onItemClicked} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
};
