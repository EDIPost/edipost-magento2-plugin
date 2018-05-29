<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
namespace Edipost\Shipment\Helper;

/**
 * Shipment helper for view.
 */
class View extends \Magento\Framework\App\Helper\AbstractHelper
{

    /**
     * Initialize dependencies.
     *
     * @param \Magento\Framework\App\Helper\Context $context
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context
    ) {
        parent::__construct($context);
    }


    /**
     * Return module directory
     *
     * @param string $moduleName [optional]
     * @param string $type [optional]
     * @return string
     * @throws \InvalidArgumentException
     */
    static function getDirectory($moduleName='Edipost_Shipment', $type = '') {
        /** @var \Magento\Framework\ObjectManagerInterface $om */
        $om = \Magento\Framework\App\ObjectManager::getInstance();
        /** @var \Magento\Framework\Module\Dir\Reader $reader */
        $reader = $om->get('Magento\Framework\Module\Dir\Reader');
        return $reader->getModuleDir($type, $moduleName);
    }

    /**
     * Return module directory
     *
     * @param int $orderId
     * @return \Magento\Sales\Model\Order
     */
    static function getOrderById($orderId) {
        $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
        return $objectManager->create('Magento\Sales\Model\Order')->load($orderId);
    }

//    static function getOrderById($orderId) {
//
//    }
}
