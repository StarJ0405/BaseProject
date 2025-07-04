import AccordionChild from "components/accordion/AccordionChild";
import AccordionWrapper from "components/accordion/AccordionWrapper";
import Dummy from "components/dummy/Dummy";
import FlexChild from "components/flex/FlexChild";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import Span from "components/span/Span";
import { useBrowserEvent } from "providers/BrowserEventProvider";
import { useLanguage } from "providers/LanguageProvider";
import { numberToChinese } from "shared/utils/Utils";

const getLabel = (data, flagCode) => {
  const label = data?.label?.[flagCode] || data?.label?.["cn"];
  return Array.isArray(label) ? (
    <VerticalFlex flexStart>
      {label.map((l) => (
        <P>{l}</P>
      ))}
    </VerticalFlex>
  ) : typeof label === "string" ? (
    <Span>{label}</Span>
  ) : (
    label
  );
};
const Wiki = ({ title, data }) => {
  const { isMobile } = useBrowserEvent();
  const { flagCode } = useLanguage();
  return (
    <VerticalFlex
      maxWidth={1200}
      flexStart
      paddingTop={isMobile ? 50 + 20 : 20}
      gap={40}
      scrollMarginTop={100}
    >
      <FlexChild
        width={"100%"}
        justifyContent={"center"}
        backgroundColor={"#eeeeee"}
        padding={"15px 0px"}
      >
        <P fontSize={isMobile ? 18 : 28} fontWeight={500}>
          {title?.label?.[flagCode] || title?.label?.["cn"]}
        </P>
      </FlexChild>
      <FlexChild
        width={"max-content"}
        border={"1px solid #dadada"}
        padding={10}
        marginLeft={isMobile ? 20 : 0}
        paddingLeft={isMobile ? 10 : 0}
      >
        <VerticalFlex flexStart fontWeight={600}>
          <FlexChild position="relative">
            <P fontSize={isMobile ? 20 : 24}>wiki-list</P>
            <FlexChild position={"absolute"} id={`list`} left={0} top={-60} />
          </FlexChild>
          <FlexChild padding={10}>
            <VerticalFlex flexStart>
              {data.map((d, index1) => (
                <FlexChild key={`list_${index1}`} position={"relative"}>
                  <P fontSize={isMobile ? 14 : 16}>
                    <a
                      href={`#content_${index1}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Span color={"#bd7f14"} paddingRight={10} textHover>
                        {numberToChinese(index1 + 1)}.
                      </Span>
                    </a>
                    {getLabel(d, flagCode)}
                  </P>
                  <FlexChild
                    position={"absolute"}
                    id={`list_${index1}`}
                    left={0}
                    top={-60}
                  />
                </FlexChild>
              ))}
            </VerticalFlex>
          </FlexChild>
        </VerticalFlex>
      </FlexChild>
      <FlexChild>
        <AccordionWrapper
          unique={false}
          active={data.map((_, index) => index)}
          gap={30}
        >
          {data.map((d, index1) => (
            <AccordionChild
              styling={{
                header: {
                  style: {
                    border: "unset",
                    borderBottom: "1px solid #dadada",
                  },
                },
                body: { style: { border: "unset" } },
                item: {
                  style: {
                    border: "unset",
                  },
                },
              }}
              header={
                <P
                  position={"relative"}
                  key={`content_${index1}`}
                  fontSize={isMobile ? 14 : 16}
                >
                  <a
                    //href={`#list_${index1}`}
                    href={`#list`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Span color={"#bd7f14"} paddingRight={10} textHover>
                      {numberToChinese(index1 + 1)}.
                    </Span>
                  </a>
                  {getLabel(d, flagCode)}
                  <FlexChild
                    id={`content_${index1}`}
                    position={"absolute"}
                    left={0}
                    top={-60}
                  />
                </P>
              }
            >
              {(d?.rows || [])
                ?.filter((r) => !r.rows || r.rows?.length === 0)
                ?.map((r, index2) => {
                  return (
                    <P key={`content_${index1}_${index2}`}>
                      {getLabel(r, flagCode)}
                    </P>
                  );
                })}
              {(d?.rows || [])
                ?.filter((r) => r.rows?.length > 0)
                ?.map((r, index2) => {
                  return (
                    <VerticalFlex key={`content_${index1}_${index2}`}>
                      <FlexChild>
                        <P weight={500}>
                          <Span>
                            {(d?.rows || [])?.filter((r) => r.rows?.length > 0)
                              ?.length > 1
                              ? `${index2 + 1}. `
                              : ""}
                          </Span>
                          {getLabel(r, flagCode)}
                        </P>
                      </FlexChild>
                      <FlexChild>
                        <VerticalFlex flexStart padding={"0px 10px"}>
                          {r.rows.map((rr, index3) => {
                            return (
                              <P key={`content_${index1}_${index2}_${index3}`}>
                                <FlexChild
                                  alignItems="flex-start"
                                  justifyContent={"flex-start"}
                                >
                                  <Span paddingRight={5}>o</Span>
                                  {getLabel(rr, flagCode)}
                                </FlexChild>
                              </P>
                            );
                          })}
                        </VerticalFlex>
                      </FlexChild>
                    </VerticalFlex>
                  );
                })}
            </AccordionChild>
          ))}
        </AccordionWrapper>
      </FlexChild>
      <Dummy height={300} />
    </VerticalFlex>
  );
};
export default Wiki;
