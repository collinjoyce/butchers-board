<?php

namespace modules;

use DateTime;
use craft\ckeditor\events\ModifyPurifierConfigEvent;
use craft\ckeditor\Field as CKEditorField;
use craft\elements\Entry;
use craft\events\ElementEvent;
use craft\services\Elements;
use yii\base\Event;
use yii\base\Module;

/**
 * Site module — project-level Craft customisations.
 *
 * Two opt-in behaviors are wired up here. Both are generic enough to keep on
 * for most projects; remove either if you don't want the behavior.
 */
class SiteModule extends Module
{
    public function init(): void
    {
        parent::init();
        $this->attachEventHandlers();
    }

    private function attachEventHandlers(): void
    {
        // Make CKEditor save <em> instead of <i> for italic text. HTML Purifier
        // runs on save so this normalises the stored HTML for all CKEditor
        // fields going forward.
        Event::on(
            CKEditorField::class,
            CKEditorField::EVENT_MODIFY_PURIFIER_CONFIG,
            static function (ModifyPurifierConfigEvent $event): void {
                $def = $event->config->getHTMLDefinition(true);
                $def->info_tag_transform['i'] = new \HTMLPurifier_TagTransform_Simple('em');
            }
        );

        // Nested entries (Matrix-style fields, if any are added) can be
        // created with a null postDate, which evaluates to "pending" on the
        // front end. Default new nested entries to "live" by assigning a
        // postDate at creation time.
        Event::on(
            Elements::class,
            Elements::EVENT_BEFORE_SAVE_ELEMENT,
            static function (ElementEvent $event): void {
                $element = $event->element;
                if (!$event->isNew || !$element instanceof Entry) {
                    return;
                }

                if ($element->fieldId === null || !$element->getIsCanonical()) {
                    return;
                }

                if ($element->postDate === null) {
                    $element->postDate = new DateTime();
                }
            }
        );
    }
}
