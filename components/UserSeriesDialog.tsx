import { Button, Card, Checkbox, Code, Dialog, Heading, HoverCard, TextArea, TextFieldInput } from '@radix-ui/themes';

import { Editor } from '@monaco-editor/react';

import * as monaco from 'monaco-editor';
import { UserSeries } from '@/app/(logic)/types';

export const UserSeriesDialog = ({
  show,
  series,
  setSeries,
  onSaveClicked,
  onCancelClicked,
}: {
  show: boolean;
  series: UserSeries;
  setSeries: (series: UserSeries) => void;
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
              <div className={'flex flex-row gap-2 items-center'}>
                <div className={'flex flex-col'}>
                  <label>Series Name</label>
                  <TextFieldInput
                    value={series.name}
                    onChange={e =>
                      setSeries({
                        ...series,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className={'flex flex-col'}>
                  <label>Preset Indicator</label>
                  <TextFieldInput
                    value={series.name}
                    onChange={e =>
                      setSeries({
                        ...series,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={'flex flex-row items-center gap-3'}>
                <div className={'flex flex-row gap-2 items-center'}>
                  <label>Overlay</label>

                  <Checkbox
                    variant={'soft'}
                    className="border border-primary-border !cursor-pointer"
                    checked={series.overlay}
                    onClick={() => {
                      setSeries({
                        ...series,
                        overlay: !series.overlay,
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={'flex flex-col'}>
              <label>Color</label>
              <input
                type="color"
                id="head"
                name="head"
                value={series.color}
                onChange={e =>
                  setSeries({
                    ...series,
                    color: e.target.value,
                  })
                }
              />
            </div>

            <div className={'flex flex-col items-start'}>
              <label>Line width</label>
              <TextFieldInput
                type={'number'}
                value={series.lineWidth}
                onChange={e =>
                  setSeries({
                    ...series,
                    lineWidth: parseInt(e.target.value) as 1 | 2 | 3 | 4,
                  })
                }
              />
            </div>

            <div className={'flex flex-col max-h-[400px] overflow-auto gap-3'}>
              <div className={'flex flex-row justify-between'}>
                <label>Series Function</label>
                <div className={'flex flex-row'}>
                  <HoverCard.Root>
                    <HoverCard.Trigger>
                      <Heading size={'3'} className={'cursor-pointer text-accent-text hover:text-accent-text-contrast'}>
                        Syntax guide
                      </Heading>
                    </HoverCard.Trigger>
                    <HoverCard.Content>
                      <div className={'flex flex-col gap-1'}>
                        <Editor
                          height="50vh"
                          width={'50vw'}
                          options={{
                            readOnly: true,
                            language: 'typescript',
                            minimap: {
                              enabled: false,
                            },
                          }}
                          defaultLanguage="typescript"
                          defaultValue={`type Series = {
  time: number; // unix timestamp
  value: number;
}[]

function seriesFunction(
  open: Series,
  high: Series,
  low: Series,
  close: Series
): Series {
  
  /** YOUR IMPLEMENTATION HERE */
  return close
}
`}
                          theme="vs-dark"
                        />
                      </div>
                    </HoverCard.Content>
                  </HoverCard.Root>
                </div>
              </div>

              <Editor
                height="90vh"
                defaultLanguage="javascript"
                value={series.seriesFunctionString}
                defaultValue={`const windowSize = 20;  // Setting the period for SMA

const smaData = data.map((current, index) => {
  if (index >= windowSize - 1) {
    // Calculate SMA only when there are enough preceding data points
    let sum = 0;
    // Sum the closing prices of the last 'windowSize' days
    for (let i = index - windowSize + 1; i <= index; i++) {
      sum += data[i].close;
    }
    let average = sum / windowSize;
    return { time: current.time, value: average };
  } else {
    return null;  // Not enough data to calculate SMA
  }
});

// Filter out the null entries, similar to your offset example
return smaData.filter(item => item !== null);`}
                theme="vs-dark"
                onChange={(value, event) => {
                  setSeries({
                    ...series,
                    seriesFunctionString: value || 'data[0].close > data[0].sma',
                  });
                }}
              />

              <div className={'flex justify-between mt-3'}>
                <Button color="gray" className={'w-32'} onClick={() => onCancelClicked()}>
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
