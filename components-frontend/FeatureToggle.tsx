import { FormControlLabel, FormGroup, Switch } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  allFeaturesInCategoryIsOn,
  FEATURE_VALUE,
  getFeaturesPerCategory,
  translateFeatureId,
} from '../components-shared/featureWrapper';

const featuresPerCategory = getFeaturesPerCategory();

export default function FeatureToggle({
  features,
  onFeaturesChanged,
}: {
  features: FEATURE_VALUE[];
  onFeaturesChanged: (
    setter: (lastFeatures: FEATURE_VALUE[]) => FEATURE_VALUE[]
  ) => void;
}) {
  const leftFeatureCategory = {
    Features: featuresPerCategory.features,
    Resources: featuresPerCategory.resources,
    'Third party features': featuresPerCategory.third_party,
  };

  const rightFeatureCategory = {
    Templates: featuresPerCategory.templates,
    Export: featuresPerCategory.export,
    Languages: featuresPerCategory.languages,
    Others: featuresPerCategory.others,
  };

  return (
    <div className="flex space-x-10">
      <div className="container w-full">
        {Object.entries(leftFeatureCategory).map((feature) => {
          return (
            <FeatureTogglePerCategory
              key={feature[0]}
              features={features}
              onFeaturesChanged={onFeaturesChanged}
              categoryTitle={feature[0]}
              featuresToDisplay={feature[1]}
            />
          );
        })}
      </div>
      <div className="container w-full">
        {Object.entries(rightFeatureCategory).map((feature) => {
          return (
            <FeatureTogglePerCategory
              key={feature[0]}
              features={features}
              onFeaturesChanged={onFeaturesChanged}
              categoryTitle={feature[0]}
              featuresToDisplay={feature[1]}
            />
          );
        })}
      </div>
    </div>
  );
}

function FeatureTogglePerCategory({
  features,
  onFeaturesChanged,
  categoryTitle,
  featuresToDisplay,
}: {
  readonly features: string[];
  readonly onFeaturesChanged: (
    setter: (lastFeatures: FEATURE_VALUE[]) => FEATURE_VALUE[]
  ) => void;
  readonly categoryTitle: string;
  readonly featuresToDisplay: FEATURE_VALUE[];
}) {
  const [isOn, setIsOn] = useState(
    allFeaturesInCategoryIsOn(featuresToDisplay, features)
  );

  useEffect(() => {
    if (allFeaturesInCategoryIsOn(featuresToDisplay, features)) {
      setIsOn(true);
    } else {
      setIsOn(false);
    }
  }, [featuresToDisplay, features]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onFeaturesChanged((lastFeatures) => {
        const checked = event.target.checked;
        const switchedFeature = event.target.name as FEATURE_VALUE;
        if (!checked) {
          return lastFeatures.filter((feature) => feature !== switchedFeature);
        }
        return [...lastFeatures, switchedFeature];
      });
    },
    [onFeaturesChanged]
  );

  const toggleAllFeatures = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onFeaturesChanged((lastFeatures) => {
        const checked = event.target.checked;
        if (!checked) {
          return lastFeatures.filter(
            (feature) => !featuresToDisplay.includes(feature)
          );
        }

        return [...new Set(lastFeatures.concat(featuresToDisplay))];
      });
    },
    [featuresToDisplay, onFeaturesChanged]
  );

  return (
    <div className="container w-full mb-10">
      <ul className="w-full">
        <div id="category-header" className="flex items-center space-x-4">
          <h2 className="my-4 text-2xl">{categoryTitle}</h2>
          <Switch
            name={categoryTitle}
            checked={isOn}
            onChange={toggleAllFeatures}
          />
          <h3 className="text-gray-500">
            {isOn ? 'Deactivate all' : 'Activate all'}
          </h3>
        </div>
        <FormGroup>
          {featuresToDisplay
            .sort((a, b) =>
              translateFeatureId(a).localeCompare(translateFeatureId(b))
            )
            .map((feature) => (
              <li className="py-0.5" key={feature}>
                <FormControlLabel
                  control={
                    <Switch
                      name={feature}
                      checked={features.includes(feature)}
                      onChange={handleChange}
                    />
                  }
                  label={translateFeatureId(feature)}
                />
              </li>
            ))}
        </FormGroup>
      </ul>
    </div>
  );
}
