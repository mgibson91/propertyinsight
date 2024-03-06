import { Box, Button, Code, Dialog, Heading, IconButton, Select, Tabs, TextFieldInput } from '@radix-ui/themes';
import { Indicator } from '@/logic/indicators/types';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';

export const EditIndicatorCodeDialog = ({
  show,
  existingIndicators,
  indicator,
  setIndicator,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  existingIndicators: Indicator[];
  indicator: Indicator;
  setIndicator: (indicator: Indicator) => void;
  onSaveClicked: (funcStr: string) => void;
  onCancelClicked: () => void;
}) => {
  const [funcStr, setFuncStr] = useState('');

  useEffect(() => {
    setFuncStr(indicator.funcStr);
  }, [indicator]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveClicked(funcStr);
    }
  };

  // Define global variables before the editor mounts
  const beforeMount = monaco => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });

    // TODO: Something with prependSpreadFunctions(prefixBuiltInFunctions(indicator.funcStr), indicator, existingIndicatorStreams)
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
      declare var existingIndicators: ${JSON.stringify(existingIndicators)};
    `);
  };

  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={''}>
        <div className={'flex flex-col gap-3'} onKeyDown={handleKeyDown}>
          <div className={'flex flex-row justify-between items-center'}>
            <Heading size={'6'}>Edit Indicator</Heading>
            <IconButton
              variant={'ghost'}
              className={'!rounded-full'}
              size={'1'}
              onClick={() => {
                onCancelClicked();
              }}
            >
              <CloseIcon></CloseIcon>
            </IconButton>
          </div>

          <Editor
            height="50vh"
            options={{
              language: 'typescript',
              minimap: {
                enabled: false,
              },
            }}
            defaultLanguage="typescript"
            value={funcStr}
            onChange={(value, event) => {
              setFuncStr(value);
            }}
            theme="vs-dark"
            beforeMount={beforeMount}
          />

          <div className={'flex flex-col max-h-[400px] overflow-auto gap-3'}>
            <div className={'flex justify-between mt-3'}>
              <Button color="gray" className={'w-32'} onClick={() => onCancelClicked()}>
                Cancel
              </Button>

              <Button className={'w-32'} onClick={() => onSaveClicked(funcStr)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
