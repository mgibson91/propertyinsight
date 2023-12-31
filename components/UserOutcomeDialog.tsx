// TODO: Change defaultValue to value so it actually changes on save

import { Button, Card, Dialog, TextFieldInput } from '@radix-ui/themes';
import { Editor } from '@monaco-editor/react';
import { UserOutcome } from "@/app/client-page";

export const UserOutcomeDialog = ({
  show,
  outcome,
  setOutcome,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  outcome: UserOutcome;
  setOutcome: (outcome: UserOutcome) => void;
  onSaveClicked: () => void;
  onCancelClicked: () => void;
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      onSaveClicked();
    }
  };

  return (
    <Dialog.Root open={show}>
      <Dialog.Content className={'min-w-[90vw]'}>
        <Card>
          <div className={'flex flex-col gap-3'} onKeyDown={handleKeyDown}>
            <div className={'flex flex-row items-start justify-between gap-3'}>
              {/*Name?*/}
              <div className={'flex flex-col'}>
                <label>Outcome Name</label>
                <TextFieldInput
                  value={outcome.name}
                  onChange={(e) =>
                    setOutcome({
                      ...outcome,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className={'flex flex-col'}>
                <label>Color</label>
                <input
                  type="color"
                  id="head"
                  name="head"
                  value={outcome.color}
                  onChange={(e) =>
                    setOutcome({
                      ...outcome,
                      color: e.target.value,
                    })
                  }
                />
              </div>

              <div className={'flex flex-col items-start'}>
                <label>Size</label>
                <TextFieldInput
                  type={'number'}
                  value={outcome.size}
                  onChange={(e) =>
                    setOutcome({
                      ...outcome,
                      size: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className={'flex flex-col max-h-[400px] overflow-auto'}>
              <label>Outcome Function</label>

              <Editor
                height="90vh"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={outcome.outcomeFunctionString}
                onChange={(value, event) => {
                  setOutcome({
                    ...outcome,
                    outcomeFunctionString:
                      value ?? 'data[0].close > data[0].sma',
                  });
                }}
              />

              <div className={'flex justify-between mt-3'}>
                <Button
                  color="gray"
                  className={'w-32'}
                  onClick={() => onCancelClicked()}
                >
                  Cancel
                </Button>

                <Button className={'w-32'} onClick={() => onSaveClicked()}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Dialog.Content>
    </Dialog.Root>
  );
};
