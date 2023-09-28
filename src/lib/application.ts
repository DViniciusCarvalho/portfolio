import { Props } from '@/types/props';
import { Data } from '@/types/data';


const filterApplicationsFunction = (
    applicationIconProps: Props.ApplicationIconProps & Data.ApplicationMetadata,
    filterString: string
): boolean => {

    const name = applicationIconProps.applicationName;
    const description = applicationIconProps.metadata.description;
    const keyWords = applicationIconProps.metadata.keyWords;
    const category = applicationIconProps.metadata.category;

    const descriptionIncludesFilterString = description
                                            .toLowerCase()
                                            .includes(filterString.toLowerCase());

    const someKeyWordIncludesFilterString = keyWords.some(keyword => 
        keyword.toLowerCase().includes(filterString.toLowerCase())
    );

    const someCategoryIncludesFilterString = category.some(category => 
        category.toLowerCase().includes(filterString.toLowerCase())
    );

    const applicationNameIncludesFilterString = name
                                                .toLowerCase()
                                                .includes(filterString.toLowerCase());

    return descriptionIncludesFilterString 
            || someKeyWordIncludesFilterString 
            || someCategoryIncludesFilterString
            || applicationNameIncludesFilterString;
};


const removeMetadataFunction = (
    applicationIconProps: Props.ApplicationIconProps & Data.ApplicationMetadata
) => {

    const { 
        metadata, 
        ...applicationIconPropsWithoutMetadata 
    } = applicationIconProps;

    return applicationIconPropsWithoutMetadata;
};


export 	const getFilteredApplicationsByNameAndMetadata = (
    applicationsIconProps: (Props.ApplicationIconProps & Data.ApplicationMetadata)[],
    filterString: string
): Props.ApplicationIconProps[] => {

    const filteredApplicationsIconProps = applicationsIconProps.filter(appIconProps => 
        filterApplicationsFunction(appIconProps, filterString)
    );

    const filteredApplicationsIconPropsWithoutMetadata = filteredApplicationsIconProps
                                                         .map(removeMetadataFunction);

    return filteredApplicationsIconPropsWithoutMetadata;
}