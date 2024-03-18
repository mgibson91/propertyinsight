import {
  Button,
  Card,
  Checkbox,
  Code,
  Dialog,
  Heading,
  HoverCard,
  IconButton,
  TextArea,
  TextFieldInput,
} from '@radix-ui/themes';

import { Editor } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import { Indicator } from '@/logic/indicators/types';
import IndicatorSearchView from '@/components/indicators/add-indicator';
import { PRESET_INDICATORS } from '@/logic/indicators/preset-indicator';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React from 'react';

export const AddIndicatorDialog = ({
  show,
  onIndicatorSelected,
  onClose,
}: {
  show: boolean;
  onIndicatorSelected: (indicator: Indicator) => void;
  onClose: () => void;
}) => {
  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={''}>
        <div className={'flex flex-col gap-3'}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'6'}>Add Indicator</Heading>
            <IconButton
              variant={'ghost'}
              className={'!rounded-full'}
              size={'1'}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon></CloseIcon>
            </IconButton>
          </div>
          <IndicatorSearchView
            indicators={PRESET_INDICATORS}
            onItemClicked={(indicator: Indicator) => {
              onIndicatorSelected(indicator);
            }}
          />
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
